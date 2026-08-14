import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { Fine } from '../fines/fine.entity';
import { FineStatus } from '../fines/enums/fine-status.enum';
import { Loan } from '../loans/loan.entity';
import { SettingsService } from '../settings/settings.service';
import type { ListMembersQueryDto } from './dto/list-members-query.dto';
import { MemberProfile } from './member-profile.entity';
import { MemberStatus } from './enums/member-status.enum';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

export type MemberListItem = MemberProfile & { activeLoanCount: number };

export type MemberDetail = MemberProfile & {
  activeLoanCount: number;
  outstandingBalanceCents: number;
  loans: Loan[];
};

export type MemberSearchHit = {
  userId: string;
  fullName: string;
  email: string;
  activeLoanCount: number;
};

export type LoanSummary = {
  userId: string;
  activeLoanCount: number;
  maxActiveLoans: number;
  remaining: number;
  status: MemberStatus;
};

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberProfile)
    private readonly members: Repository<MemberProfile>,
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
    @InjectRepository(Fine)
    private readonly fines: Repository<Fine>,
    private readonly settings: SettingsService,
  ) {}

  findByUserId(userId: string): Promise<MemberProfile | null> {
    return this.members.findOne({ where: { userId } });
  }

  async requireByUserId(userId: string): Promise<MemberProfile> {
    const profile = await this.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Member not found');
    }
    return profile;
  }

  async requireActiveMember(userId: string): Promise<MemberProfile> {
    const profile = await this.requireByUserId(userId);
    if (profile.status === MemberStatus.Suspended) {
      throw new BadRequestException('Member is suspended');
    }
    return profile;
  }

  /**
   * Idempotent provision — return existing row for userId if present.
   * Concurrent inserts race on UNIQUE(user_id); re-read on conflict.
   */
  async provision(input: {
    userId: string;
    email: string;
    fullName: string;
  }): Promise<MemberProfile> {
    const existing = await this.findByUserId(input.userId);
    if (existing) return existing;

    try {
      return await this.members.save(
        this.members.create({
          userId: input.userId,
          email: input.email.toLowerCase(),
          fullName: input.fullName,
          status: MemberStatus.Active,
        }),
      );
    } catch (err) {
      if (isUniqueViolation(err)) {
        const again = await this.findByUserId(input.userId);
        if (again) return again;
      }
      throw err;
    }
  }

  async syncMirrors(
    userId: string,
    input: { email?: string; fullName?: string },
  ): Promise<MemberProfile | null> {
    const profile = await this.findByUserId(userId);
    if (!profile) return null;
    if (input.email !== undefined) profile.email = input.email.toLowerCase();
    if (input.fullName !== undefined) profile.fullName = input.fullName;
    return this.members.save(profile);
  }

  async list(query: ListMembersQueryDto): Promise<{
    items: MemberListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.members.createQueryBuilder('m');
    if (query.status) {
      qb.andWhere('m.status = :status', { status: query.status });
    }
    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`;
      qb.andWhere(
        '(m.full_name ILIKE :q OR m.email ILIKE :q OR CAST(m.user_id AS text) ILIKE :q)',
        { q },
      );
    }
    qb.orderBy('m.fullName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const counts = await this.activeLoanCounts(rows.map((r) => r.userId));

    const items = rows.map((row) =>
      Object.assign(row, { activeLoanCount: counts.get(row.userId) ?? 0 }),
    );
    return { items, total, page, limit };
  }

  async search(q: string): Promise<MemberSearchHit[]> {
    const term = q.trim();
    if (!term) {
      throw new BadRequestException('q is required');
    }
    const like = `%${term}%`;
    const rows = await this.members
      .createQueryBuilder('m')
      .where(
        '(m.full_name ILIKE :q OR m.email ILIKE :q OR CAST(m.user_id AS text) ILIKE :q)',
        { q: like },
      )
      .orderBy('m.fullName', 'ASC')
      .take(20)
      .getMany();

    const counts = await this.activeLoanCounts(rows.map((r) => r.userId));
    return rows.map((r) => ({
      userId: r.userId,
      fullName: r.fullName,
      email: r.email,
      activeLoanCount: counts.get(r.userId) ?? 0,
    }));
  }

  async findDetail(userId: string): Promise<MemberDetail> {
    const profile = await this.requireByUserId(userId);
    const [activeLoanCount, outstandingBalanceCents, loans] = await Promise.all([
      this.loans.count({ where: { userId, returnedAt: IsNull() } }),
      this.sumOutstandingFines(userId),
      this.loans.find({
        where: { userId },
        order: { borrowedAt: 'DESC' },
        take: 50,
        relations: { book: true, bookCopy: true },
      }),
    ]);

    return Object.assign(profile, {
      activeLoanCount,
      outstandingBalanceCents,
      loans,
    });
  }

  async loanSummary(userId: string): Promise<LoanSummary> {
    const profile = await this.requireByUserId(userId);
    const [activeLoanCount, maxActiveLoans] = await Promise.all([
      this.loans.count({ where: { userId, returnedAt: IsNull() } }),
      this.settings.getMaxActiveLoans(),
    ]);
    return {
      userId,
      activeLoanCount,
      maxActiveLoans,
      remaining: Math.max(0, maxActiveLoans - activeLoanCount),
      status: profile.status,
    };
  }

  async suspend(
    userId: string,
    reason: string,
    adminUserId: string,
  ): Promise<MemberProfile> {
    const profile = await this.requireByUserId(userId);
    if (profile.status === MemberStatus.Suspended) {
      throw new BadRequestException('Member is already suspended');
    }
    profile.status = MemberStatus.Suspended;
    profile.suspendedReason = reason.trim();
    profile.suspendedAt = new Date();
    profile.suspendedBy = adminUserId;
    return this.members.save(profile);
  }

  async reinstate(userId: string): Promise<MemberProfile> {
    const profile = await this.requireByUserId(userId);
    if (profile.status !== MemberStatus.Suspended) {
      throw new BadRequestException('Member is not suspended');
    }
    profile.status = MemberStatus.Active;
    profile.suspendedReason = null;
    profile.suspendedAt = null;
    profile.suspendedBy = null;
    return this.members.save(profile);
  }

  private async activeLoanCounts(userIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (userIds.length === 0) return map;

    const rows = await this.loans
      .createQueryBuilder('loan')
      .select('loan.user_id', 'userId')
      .addSelect('COUNT(*)', 'cnt')
      .where('loan.user_id IN (:...userIds)', { userIds })
      .andWhere('loan.returned_at IS NULL')
      .groupBy('loan.user_id')
      .getRawMany<{ userId: string; cnt: string }>();

    for (const row of rows) {
      map.set(row.userId, Number(row.cnt));
    }
    return map;
  }

  private async sumOutstandingFines(userId: string): Promise<number> {
    const raw = await this.fines
      .createQueryBuilder('fine')
      .select('COALESCE(SUM(fine.amount_cents), 0)', 'total')
      .where('fine.user_id = :userId', { userId })
      .andWhere('fine.status = :status', { status: FineStatus.Unpaid })
      .getRawOne<{ total: string }>();
    return Number(raw?.total ?? 0);
  }
}
