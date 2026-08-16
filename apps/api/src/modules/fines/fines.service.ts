import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { calendarDaysOverdue, todayIsoDate } from '../../common/iso-date';
import { Loan } from '../loans/loan.entity';
import { SettingsService } from '../settings/settings.service';
import type { ListFinesQueryDto } from './dto/list-fines-query.dto';
import type { WaiveFineDto } from './dto/waive-fine.dto';
import { FineStatus } from './enums/fine-status.enum';
import { Fine } from './fine.entity';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly fines: Repository<Fine>,
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
    private readonly settings: SettingsService,
  ) {}

  /**
   * Create or refresh unpaid fines for still-open overdue loans so
   * outstanding totals match what members see on My Loans.
   */
  async accrueOverdueFines(userId?: string): Promise<void> {
    const fineCentsPerDay = await this.settings.getFineCentsPerDay();
    if (fineCentsPerDay <= 0) return;

    const today = todayIsoDate();
    const qb = this.loans
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.fine', 'fine')
      .where('loan.returned_at IS NULL')
      .andWhere('loan.due_date < :today', { today });

    if (userId) {
      qb.andWhere('loan.user_id = :userId', { userId });
    }

    const overdueLoans = await qb.getMany();
    const now = new Date();

    for (const loan of overdueLoans) {
      const daysOverdue = calendarDaysOverdue(loan.dueDate, now);
      if (daysOverdue <= 0) continue;

      const amountCents = daysOverdue * fineCentsPerDay;
      const existing = loan.fine;

      if (!existing) {
        const fine = this.fines.create({
          loanId: loan.id,
          userId: loan.userId,
          daysOverdue,
          amountCents,
          status: FineStatus.Unpaid,
          paidAt: null,
          markedPaidBy: null,
        });
        try {
          await this.fines.save(fine);
        } catch (err) {
          if (!isUniqueViolation(err)) throw err;
        }
        continue;
      }

      if (existing.status !== FineStatus.Unpaid) continue;
      if (existing.daysOverdue === daysOverdue && existing.amountCents === amountCents) {
        continue;
      }

      existing.daysOverdue = daysOverdue;
      existing.amountCents = amountCents;
      await this.fines.save(existing);
    }
  }

  async list(query: ListFinesQueryDto): Promise<{
    items: Fine[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.accrueOverdueFines(query.userId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.fines.createQueryBuilder('fine');

    if (query.userId) {
      qb.andWhere('fine.user_id = :userId', { userId: query.userId });
    }
    if (query.status) {
      qb.andWhere('fine.status = :status', { status: query.status });
    }

    const total = await qb.clone().getCount();
    const idRows = await qb
      .select('fine.id', 'id')
      .orderBy('fine.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ id: string }>();
    const ids = idRows.map((row) => row.id);
    if (ids.length === 0) {
      return { items: [], total, page, limit };
    }

    const loaded = await this.fines.find({
      where: { id: In(ids) },
      relations: { loan: { book: true } },
    });
    const byId = new Map(loaded.map((row) => [row.id, row]));
    const items = ids
      .map((id) => byId.get(id))
      .filter((row): row is Fine => Boolean(row));
    items.sort((a, b) => {
      const rank = (status: FineStatus) => {
        if (status === FineStatus.Unpaid) return 0;
        if (status === FineStatus.Paid) return 1;
        return 2;
      };
      const byStatus = rank(a.status) - rank(b.status);
      if (byStatus !== 0) return byStatus;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return { items, total, page, limit };
  }

  listMine(userId: string, query: ListFinesQueryDto) {
    return this.list({ ...query, userId });
  }

  async findOne(id: string): Promise<Fine> {
    const fine = await this.fines.findOne({
      where: { id },
      relations: { loan: { book: true } },
    });
    if (!fine) {
      throw new NotFoundException('Fine not found');
    }
    return fine;
  }

  async markPaid(id: string, staffUserId: string): Promise<Fine> {
    const fine = await this.findOne(id);
    if (fine.status !== FineStatus.Unpaid) {
      throw new BadRequestException(
        fine.status === FineStatus.Paid
          ? 'Fine is already paid'
          : 'Fine is already waived',
      );
    }
    fine.status = FineStatus.Paid;
    fine.paidAt = new Date();
    fine.markedPaidBy = staffUserId;
    return this.fines.save(fine);
  }

  async waive(id: string, dto: WaiveFineDto, staffUserId: string): Promise<Fine> {
    const fine = await this.findOne(id);
    if (fine.status !== FineStatus.Unpaid) {
      throw new BadRequestException(
        fine.status === FineStatus.Waived
          ? 'Fine is already waived'
          : 'Fine is already paid',
      );
    }
    fine.status = FineStatus.Waived;
    fine.waivedReason = dto.reason.trim();
    fine.waivedAt = new Date();
    fine.waivedBy = staffUserId;
    return this.fines.save(fine);
  }
}
