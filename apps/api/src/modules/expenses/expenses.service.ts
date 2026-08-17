import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, In, Not, Repository } from 'typeorm';
import type { PublicUser } from '../users';
import { GroupsService } from '../groups/groups.service';
import { shareSum } from '../../common/utils/split.util';
import { Expense } from './expense.entity';
import { Share } from './share.entity';
import type { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

export type ExpenseListFilters = {
  limit?: number;
  page?: number;
  from?: string;
  to?: string;
  payerUserId?: string;
  q?: string;
  category?: string;
  sortBy?: 'expenseDate' | 'amountCents' | 'description';
  sortDir?: 'ASC' | 'DESC';
};

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
    @InjectRepository(Share)
    private readonly shares: Repository<Share>,
    private readonly groupsService: GroupsService,
  ) {}

  async create(groupId: string, dto: CreateExpenseDto, user: PublicUser) {
    await this.groupsService.assertWritable(groupId, user);
    this.validateShares(dto.amountCents, dto.shares);
    await this.assertParticipants(groupId, dto.payerUserId, dto.shares);

    const created = await this.expenses.manager.transaction(async (em) => {
      const expense = await em.save(
        Expense,
        em.create(Expense, {
          groupId,
          description: dto.description.trim(),
          amountCents: dto.amountCents,
          payerUserId: dto.payerUserId,
          createdByUserId: user.id,
          category: dto.category?.trim() || null,
          expenseDate: new Date(dto.expenseDate),
        }),
      );

      await em.save(
        Share,
        dto.shares.map((s) =>
          em.create(Share, {
            expenseId: expense.id,
            userId: s.userId,
            amountCents: s.amountCents,
          }),
        ),
      );

      return expense;
    });

    return this.findOne(groupId, created.id, user);
  }

  async findByGroup(groupId: string, user: PublicUser, filters: ExpenseListFilters = {}) {
    await this.groupsService.assertReadable(groupId, user);

    const limit = Math.min(Math.max(filters.limit ?? 10, 1), 50);
    const page = Math.max(filters.page ?? 1, 1);
    const sortBy = filters.sortBy ?? 'expenseDate';
    const sortDir = filters.sortDir === 'ASC' ? 'ASC' : 'DESC';
    let sortColumn = 'e.expenseDate';
    if (sortBy === 'amountCents') sortColumn = 'e.amountCents';
    else if (sortBy === 'description') sortColumn = 'e.description';

    const qb = this.expenses
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.payer', 'payer')
      .where('e.groupId = :groupId', { groupId })
      .andWhere('e.deletedAt IS NULL');

    if (filters.payerUserId) {
      qb.andWhere('e.payerUserId = :payerUserId', { payerUserId: filters.payerUserId });
    }
    if (filters.from) {
      qb.andWhere('e.expenseDate >= :from', { from: new Date(filters.from) });
    }
    if (filters.to) {
      qb.andWhere('e.expenseDate <= :to', { to: endOfDay(filters.to) });
    }
    if (filters.q?.trim()) {
      qb.andWhere('e.description ILIKE :q', { q: `%${filters.q.trim()}%` });
    }
    if (filters.category?.trim()) {
      qb.andWhere('e.category ILIKE :category', {
        category: `%${filters.category.trim()}%`,
      });
    }

    const total = await qb.clone().getCount();
    const rows = await qb
      .orderBy(sortColumn, sortDir)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const items = await this.attachShares(rows);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(groupId: string, expenseId: string, user: PublicUser) {
    await this.groupsService.assertReadable(groupId, user);

    const expense = await this.expenses.findOne({
      where: { id: expenseId, groupId, deletedAt: IsNull() },
      relations: ['payer', 'createdBy'],
    });
    if (!expense) throw new NotFoundException('Expense not available');

    const shares = await this.shares.find({ where: { expenseId } });
    return this.toDetail(
      expense,
      shares.map((s) => ({ userId: s.userId, amountCents: s.amountCents })),
      expense.createdBy.name,
    );
  }

  async update(
    groupId: string,
    expenseId: string,
    dto: UpdateExpenseDto,
    user: PublicUser,
  ) {
    await this.groupsService.assertWritable(groupId, user);
    await this.groupsService.assertInGroupAdmin(groupId, user);
    this.validateShares(dto.amountCents, dto.shares);
    await this.assertParticipants(groupId, dto.payerUserId, dto.shares);

    const expense = await this.expenses.findOne({
      where: { id: expenseId, groupId, deletedAt: IsNull() },
    });
    if (!expense) throw new NotFoundException('Expense not available');

    await this.expenses.manager.transaction(async (em) => {
      expense.description = dto.description.trim();
      expense.amountCents = dto.amountCents;
      expense.payerUserId = dto.payerUserId;
      expense.category = dto.category?.trim() || null;
      expense.expenseDate = new Date(dto.expenseDate);
      await em.save(expense);

      await em.delete(Share, { expenseId: expense.id });
      await em.save(
        Share,
        dto.shares.map((s) =>
          em.create(Share, {
            expenseId: expense.id,
            userId: s.userId,
            amountCents: s.amountCents,
          }),
        ),
      );
    });

    return this.findOne(groupId, expense.id, user);
  }

  async softDelete(groupId: string, expenseId: string, user: PublicUser) {
    await this.groupsService.assertWritable(groupId, user);
    await this.groupsService.assertInGroupAdmin(groupId, user);

    const expense = await this.expenses.findOne({
      where: { id: expenseId, groupId, deletedAt: IsNull() },
    });
    if (!expense) throw new NotFoundException('Expense not available');

    expense.deletedAt = new Date();
    expense.deletedByUserId = user.id;
    await this.expenses.save(expense);
    return { message: 'Expense deleted' };
  }

  async findDeleted(groupId: string, user: PublicUser) {
    await this.groupsService.assertReadable(groupId, user);
    if (!this.groupsService.isPlatformAdmin(user)) {
      await this.groupsService.assertInGroupAdmin(groupId, user);
    }

    const rows = await this.expenses.find({
      where: { groupId, deletedAt: Not(IsNull()) },
      relations: ['payer', 'deletedBy'],
      order: { deletedAt: 'DESC' },
      take: 50,
    });

    const mapped = await this.attachShares(rows);
    return mapped.map((row, i) => ({
      ...row,
      deletedAt: rows[i]!.deletedAt?.toISOString() ?? null,
      deletedBy: rows[i]!.deletedBy
        ? { id: rows[i]!.deletedBy.id, name: rows[i]!.deletedBy.name }
        : null,
    }));
  }

  private validateShares(
    amountCents: number,
    shares: { userId: string; amountCents: number }[],
  ) {
    if (amountCents < 1) {
      throw new BadRequestException('Amount must be at least 1 cent');
    }
    const ids = shares.map((s) => s.userId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Share amounts must equal expense total');
    }
    if (shareSum(shares) !== amountCents) {
      throw new BadRequestException('Share amounts must equal expense total');
    }
  }

  private async assertParticipants(
    groupId: string,
    payerUserId: string,
    shares: { userId: string }[],
  ) {
    const memberIds = await this.groupsService.getMemberUserIds(groupId);
    if (!memberIds.has(payerUserId)) {
      throw new BadRequestException('User is not a group member');
    }
    for (const share of shares) {
      if (!memberIds.has(share.userId)) {
        throw new BadRequestException('User is not a group member');
      }
    }
  }

  private async attachShares(rows: Expense[]) {
    const expenseIds = rows.map((e) => e.id);
    const allShares =
      expenseIds.length > 0
        ? await this.shares.find({ where: { expenseId: In(expenseIds) } })
        : [];

    return rows.map((expense) => ({
      id: expense.id,
      description: expense.description,
      amountCents: expense.amountCents,
      category: expense.category,
      expenseDate: expense.expenseDate.toISOString(),
      payer: {
        id: expense.payer.id,
        name: expense.payer.name,
      },
      shares: allShares
        .filter((s) => s.expenseId === expense.id)
        .map((s) => ({ userId: s.userId, amountCents: s.amountCents })),
    }));
  }

  private toDetail(
    expense: Expense,
    shares: { userId: string; amountCents: number }[],
    createdByName: string,
  ) {
    return {
      id: expense.id,
      description: expense.description,
      amountCents: expense.amountCents,
      category: expense.category,
      expenseDate: expense.expenseDate.toISOString(),
      payer: expense.payer
        ? { id: expense.payer.id, name: expense.payer.name }
        : { id: expense.payerUserId, name: createdByName },
      createdBy: { id: expense.createdByUserId, name: createdByName },
      shares,
    };
  }
}

function endOfDay(iso: string) {
  const d = new Date(iso);
  if (iso.length <= 10) {
    d.setHours(23, 59, 59, 999);
  }
  return d;
}
