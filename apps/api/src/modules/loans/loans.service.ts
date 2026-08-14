import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, QueryFailedError, Repository } from 'typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { BookCopyStatus } from '../books/enums/book-copy-status.enum';
import { Fine } from '../fines/fine.entity';
import { FineStatus } from '../fines/enums/fine-status.enum';
import { MembersService } from '../members/members.service';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { SettingsService } from '../settings/settings.service';
import type { CheckoutLoanDto } from './dto/checkout-loan.dto';
import type { ListLoansQueryDto } from './dto/list-loans-query.dto';
import type { LookupLoanQueryDto } from './dto/lookup-loan-query.dto';
import { Loan } from './loan.entity';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(baseIso: string, days: number): string {
  const d = new Date(`${baseIso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Calendar days late (ceil); 0 if on/before due date. */
export function calendarDaysOverdue(dueDate: string, returnedAt: Date): number {
  const due = new Date(`${dueDate}T00:00:00.000Z`);
  const returnedDay = new Date(
    Date.UTC(
      returnedAt.getUTCFullYear(),
      returnedAt.getUTCMonth(),
      returnedAt.getUTCDate(),
    ),
  );
  const ms = returnedDay.getTime() - due.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
    @InjectRepository(Fine)
    private readonly fines: Repository<Fine>,
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
    private readonly dataSource: DataSource,
    private readonly members: MembersService,
    private readonly settings: SettingsService,
  ) {}

  async list(query: ListLoansQueryDto): Promise<{
    items: Loan[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.loans
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.bookCopy', 'bookCopy')
      .leftJoinAndSelect('loan.fine', 'fine');

    if (query.userId) {
      qb.andWhere('loan.user_id = :userId', { userId: query.userId });
    }
    if (query.bookId) {
      qb.andWhere('loan.book_id = :bookId', { bookId: query.bookId });
    }
    this.applyStatusFilter(qb, query.status);

    qb.orderBy('loan.borrowedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async listMine(
    userId: string,
    query: ListLoansQueryDto,
  ): Promise<{ items: Loan[]; total: number; page: number; limit: number }> {
    return this.list({ ...query, userId });
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loans.findOne({
      where: { id },
      relations: { book: true, bookCopy: true, fine: true },
    });
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    return loan;
  }

  async listOverdue(query: ListLoansQueryDto): Promise<{
    items: Array<
      Loan & {
        daysLate: number;
        fineAmountCents: number | null;
        fineStatus: FineStatus | null;
      }
    >;
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const today = todayIsoDate();

    const qb = this.loans
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.bookCopy', 'bookCopy')
      .leftJoinAndSelect('loan.fine', 'fine')
      .where('loan.returned_at IS NULL')
      .andWhere('loan.due_date < :today', { today })
      .orderBy('loan.due_date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const items = rows.map((loan) => {
      const daysLate = calendarDaysOverdue(loan.dueDate, new Date());
      return Object.assign(loan, {
        daysLate,
        fineAmountCents: loan.fine?.amountCents ?? null,
        fineStatus: loan.fine?.status ?? null,
      });
    });
    return { items, total, page, limit };
  }

  async lookup(query: LookupLoanQueryDto): Promise<Loan> {
    const hasBarcode = Boolean(query.barcode?.trim());
    const hasUserId = Boolean(query.userId);
    const hasLoanId = Boolean(query.loanId);
    const provided = [hasBarcode, hasUserId, hasLoanId].filter(Boolean).length;
    if (provided !== 1) {
      throw new BadRequestException('Provide exactly one of barcode, userId, or loanId');
    }

    if (hasLoanId) {
      const loan = await this.loans.findOne({
        where: { id: query.loanId!, returnedAt: IsNull() },
        relations: { book: true, bookCopy: true, fine: true },
      });
      if (!loan) {
        throw new NotFoundException('No active loan found');
      }
      return loan;
    }

    if (hasBarcode) {
      const copy = await this.copies.findOne({
        where: { barcode: query.barcode!.trim() },
      });
      if (!copy) {
        throw new NotFoundException('No active loan found');
      }
      const loan = await this.loans.findOne({
        where: { bookCopyId: copy.id, returnedAt: IsNull() },
        relations: { book: true, bookCopy: true, fine: true },
      });
      if (!loan) {
        throw new NotFoundException('No active loan found');
      }
      return loan;
    }

    const loan = await this.loans.findOne({
      where: { userId: query.userId!, returnedAt: IsNull() },
      relations: { book: true, bookCopy: true, fine: true },
      order: { borrowedAt: 'DESC' },
    });
    if (!loan) {
      throw new NotFoundException('No active loan found');
    }
    return loan;
  }

  async checkout(dto: CheckoutLoanDto, staffUserId: string): Promise<Loan> {
    await this.members.requireActiveMember(dto.userId);

    const maxLoans = await this.settings.getMaxActiveLoans();
    const defaultDays = await this.settings.getDefaultLoanDays();
    const dueDate = dto.dueDate?.slice(0, 10) ?? addDaysIso(todayIsoDate(), defaultDays);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const copy = await queryRunner.manager
        .getRepository(BookCopy)
        .createQueryBuilder('copy')
        .setLock('pessimistic_write')
        .where('copy.id = :id', { id: dto.bookCopyId })
        .andWhere('copy.deleted_at IS NULL')
        .getOne();

      if (!copy) {
        throw new NotFoundException('Book copy not found');
      }
      if (copy.status !== BookCopyStatus.Available) {
        throw new ConflictException('Copy is already on loan or unavailable');
      }

      const book = await queryRunner.manager.findOne(Book, {
        where: { id: copy.bookId },
      });
      if (!book || book.deletedAt) {
        throw new NotFoundException('Book not found');
      }

      const activeCount = await queryRunner.manager.count(Loan, {
        where: { userId: dto.userId, returnedAt: IsNull() },
      });
      if (activeCount >= maxLoans) {
        throw new BadRequestException(
          `Member has reached the active loan limit (${maxLoans})`,
        );
      }

      const loan = queryRunner.manager.create(Loan, {
        userId: dto.userId,
        bookCopyId: copy.id,
        bookId: copy.bookId,
        dueDate,
        checkedOutBy: staffUserId,
        returnedAt: null,
        returnedTo: null,
      });

      let saved: Loan;
      try {
        saved = await queryRunner.manager.save(loan);
      } catch (err) {
        if (isUniqueViolation(err)) {
          throw new ConflictException('Copy is already on loan');
        }
        throw err;
      }

      copy.status = BookCopyStatus.OnLoan;
      await queryRunner.manager.save(copy);

      await queryRunner.commitTransaction();

      return this.findOne(saved.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async returnLoan(id: string, staffUserId: string): Promise<Loan> {
    const fineCentsPerDay = await this.settings.getFineCentsPerDay();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loan = await queryRunner.manager
        .getRepository(Loan)
        .createQueryBuilder('loan')
        .setLock('pessimistic_write')
        .where('loan.id = :id', { id })
        .getOne();

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }
      if (loan.returnedAt) {
        throw new BadRequestException('Loan already returned');
      }

      const copy = await queryRunner.manager
        .getRepository(BookCopy)
        .createQueryBuilder('copy')
        .setLock('pessimistic_write')
        .where('copy.id = :id', { id: loan.bookCopyId })
        .getOne();

      if (!copy) {
        throw new NotFoundException('Book copy not found');
      }

      const now = new Date();
      loan.returnedAt = now;
      loan.returnedTo = staffUserId;
      await queryRunner.manager.save(loan);

      copy.status = BookCopyStatus.Available;
      await queryRunner.manager.save(copy);

      const daysOverdue = calendarDaysOverdue(loan.dueDate, now);
      if (daysOverdue > 0 && fineCentsPerDay > 0) {
        const fine = queryRunner.manager.create(Fine, {
          loanId: loan.id,
          userId: loan.userId,
          daysOverdue,
          amountCents: daysOverdue * fineCentsPerDay,
          status: FineStatus.Unpaid,
          paidAt: null,
          markedPaidBy: null,
        });
        try {
          await queryRunner.manager.save(fine);
        } catch (err) {
          if (!isUniqueViolation(err)) throw err;
          // Duplicate fine for loan — ignore (idempotent retry)
        }
      }

      await this.promoteOldestReservation(
        queryRunner.manager.getRepository(Reservation),
        loan.bookId,
      );

      await queryRunner.commitTransaction();
      return this.findOne(loan.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /** FIFO: fulfill oldest active reservation and renumber remaining queue. */
  private async promoteOldestReservation(
    repo: Repository<Reservation>,
    bookId: string,
  ): Promise<void> {
    const oldest = await repo
      .createQueryBuilder('r')
      .setLock('pessimistic_write')
      .where('r.book_id = :bookId', { bookId })
      .andWhere('r.status = :status', { status: ReservationStatus.Active })
      .orderBy('r.created_at', 'ASC')
      .getOne();

    if (!oldest) return;

    oldest.status = ReservationStatus.Fulfilled;
    oldest.fulfilledAt = new Date();
    oldest.queuePosition = null;
    await repo.save(oldest);

    const remaining = await repo
      .createQueryBuilder('r')
      .setLock('pessimistic_write')
      .where('r.book_id = :bookId', { bookId })
      .andWhere('r.status = :status', { status: ReservationStatus.Active })
      .orderBy('r.created_at', 'ASC')
      .getMany();

    for (let i = 0; i < remaining.length; i += 1) {
      const row = remaining[i]!;
      row.queuePosition = i + 1;
    }
    if (remaining.length > 0) {
      await repo.save(remaining);
    }
  }

  private applyStatusFilter(
    qb: ReturnType<Repository<Loan>['createQueryBuilder']>,
    status?: 'active' | 'returned' | 'overdue',
  ): void {
    if (!status) return;
    const today = todayIsoDate();
    if (status === 'active') {
      qb.andWhere('loan.returned_at IS NULL');
    } else if (status === 'returned') {
      qb.andWhere('loan.returned_at IS NOT NULL');
    } else if (status === 'overdue') {
      qb.andWhere('loan.returned_at IS NULL').andWhere('loan.due_date < :today', {
        today,
      });
    }
  }
}
