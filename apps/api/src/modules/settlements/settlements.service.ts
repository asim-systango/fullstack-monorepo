import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PublicUser } from '../users';
import { BalancesService } from '../balances/balances.service';
import { GroupsService } from '../groups/groups.service';
import { Settlement } from './settlement.entity';
import type { CreateSettlementDto } from './dto/create-settlement.dto';

@Injectable()
export class SettlementsService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlements: Repository<Settlement>,
    private readonly groupsService: GroupsService,
    private readonly balancesService: BalancesService,
  ) {}

  async create(groupId: string, dto: CreateSettlementDto, user: PublicUser) {
    await this.groupsService.assertWritable(groupId, user);

    if (dto.payerUserId === dto.payeeUserId) {
      throw new BadRequestException('Payer and payee must be different people');
    }

    const memberIds = await this.groupsService.getMemberUserIds(groupId);
    if (!memberIds.has(dto.payerUserId) || !memberIds.has(dto.payeeUserId)) {
      throw new BadRequestException('User is not a group member');
    }

    const balances = await this.balancesService.compute(groupId, user);
    const outstanding = this.balancesService.outstandingBetween(
      balances.members,
      dto.payerUserId,
      dto.payeeUserId,
    );
    if (dto.amountCents > outstanding) {
      throw new BadRequestException('Settlement exceeds outstanding balance');
    }

    const saved = await this.settlements.save(
      this.settlements.create({
        groupId,
        payerUserId: dto.payerUserId,
        payeeUserId: dto.payeeUserId,
        createdByUserId: user.id,
        amountCents: dto.amountCents,
        note: dto.note?.trim() || null,
        settledAt: new Date(),
      }),
    );

    const row = await this.settlements.findOneOrFail({
      where: { id: saved.id },
      relations: ['payer', 'payeeUser'],
    });
    return this.toDto(row);
  }

  async findByGroup(groupId: string, user: PublicUser) {
    await this.groupsService.assertReadable(groupId, user);

    const rows = await this.settlements.find({
      where: { groupId },
      relations: ['payer', 'payeeUser'],
      order: { settledAt: 'DESC' },
      take: 50,
    });

    return rows.map((row) => this.toDto(row));
  }

  async listForUser(
    user: PublicUser,
    opts: {
      page?: number;
      limit?: number;
      q?: string;
      groupId?: string;
    } = {},
  ) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts.limit ?? 10));
    const q = opts.q?.trim().toLowerCase() ?? '';

    const accessibleGroups = await this.groupsService.findAccessibleGroups(user);
    let groupIds = accessibleGroups.map((g) => g.id);

    if (opts.groupId) {
      if (!groupIds.includes(opts.groupId)) {
        const isAdmin = this.groupsService.isPlatformAdmin(user);
        if (!isAdmin) {
          throw new ForbiddenException('Not a member of this group');
        }
        await this.groupsService.requireGroup(opts.groupId);
        groupIds = [opts.groupId];
      } else {
        groupIds = [opts.groupId];
      }
    }

    const groupOptions = accessibleGroups.map(({ id, name }) => ({ id, name }));
    const emptyStats = { totalSettlements: 0, totalAmountCents: 0 };

    if (groupIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
        stats: emptyStats,
        groupOptions,
      };
    }

    const qb = this.settlements
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.group', 'group')
      .innerJoinAndSelect('s.payer', 'payer')
      .innerJoinAndSelect('s.payeeUser', 'payee')
      .where('s.groupId IN (:...groupIds)', { groupIds });

    if (q) {
      qb.andWhere(
        `(LOWER(payer.name) LIKE :q
          OR LOWER(payee.name) LIKE :q
          OR LOWER(COALESCE(s.note, '')) LIKE :q
          OR LOWER(group.name) LIKE :q)`,
        { q: `%${q}%` },
      );
    }

    qb.orderBy('s.settledAt', 'DESC').addOrderBy('s.createdAt', 'DESC');

    const total = await qb.clone().getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const statsQb = this.settlements
      .createQueryBuilder('s')
      .innerJoin('s.group', 'group')
      .innerJoin('s.payer', 'payer')
      .innerJoin('s.payeeUser', 'payee')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(s.amountCents), 0)', 'amount')
      .where('s.groupId IN (:...groupIds)', { groupIds });

    if (q) {
      statsQb.andWhere(
        `(LOWER(payer.name) LIKE :q
          OR LOWER(payee.name) LIKE :q
          OR LOWER(COALESCE(s.note, '')) LIKE :q
          OR LOWER(group.name) LIKE :q)`,
        { q: `%${q}%` },
      );
    }

    const statsRow = await statsQb.getRawOne<{ count: string; amount: string }>();
    const stats = {
      totalSettlements: Number(statsRow?.count ?? 0),
      totalAmountCents: Number(statsRow?.amount ?? 0),
    };

    return {
      items: rows.map((row) => ({
        ...this.toDto(row),
        groupName: row.group.name,
        groupCurrency: row.group.currency,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats,
      groupOptions,
    };
  }

  private toDto(row: Settlement) {
    return {
      id: row.id,
      groupId: row.groupId,
      payer: row.payer
        ? { id: row.payer.id, name: row.payer.name }
        : { id: row.payerUserId, name: '' },
      payee: row.payeeUser
        ? { id: row.payeeUser.id, name: row.payeeUser.name }
        : { id: row.payeeUserId, name: '' },
      amountCents: row.amountCents,
      note: row.note,
      settledAt: row.settledAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }
}
