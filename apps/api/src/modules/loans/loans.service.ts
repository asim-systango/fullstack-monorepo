import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, QueryFailedError, Repository } from 'typeorm';
import { addDaysIso, calendarDaysOverdue, todayIsoDate } from '../../common/iso-date';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { BookCopyStatus } from '../books/enums/book-copy-status.enum';
import { CheckoutRequest } from '../checkout-requests/checkout-request.entity';
import { CheckoutRequestStatus } from '../checkout-requests/enums/checkout-request-status.enum';
import { Fine } from '../fines/fine.entity';
import { FineStatus } from '../fines/enums/fine-status.enum';
import { FinesService } from '../fines/fines.service';
import { LibraryNotificationsService } from '../mailer';
import { MemberProfile } from '../members/member-profile.entity';
import { MembersService } from '../members/members.service';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { SettingsService } from '../settings/settings.service';
import {
  MEMBER_BORROW_LIMIT_MESSAGE,
  OVERDUE_NOTICE_COOLDOWN_MS,
  OVERDUE_RETURN_SETTLEMENT_MESSAGE,
} from './borrow-limit';
import type { CheckoutLoanDto } from './dto/checkout-loan.dto';
import type { ListLoansQueryDto } from './dto/list-loans-query.dto';
import type { LookupLoanQueryDto } from './dto/lookup-loan-query.dto';
import type { ReturnLoanDto } from './dto/return-loan.dto';
import { Loan } from './loan.entity';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

type OverdueNoticeOutcome = {
  status: 'sent' | 'skipped' | 'failed';
  reason?: 'cooldown' | 'invalid' | 'smtp' | 'no_email';
};

export type OverdueNoticeBulkResult = {
  sent: number;
  skipped: number;
  failed: number;
};

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

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
    @InjectRepository(MemberProfile)
    private readonly memberProfiles: Repository<MemberProfile>,
    private readonly dataSource: DataSource,
    private readonly members: MembersService,
    private readonly settings: SettingsService,
    private readonly libraryMail: LibraryNotificationsService,
    private readonly finesService: FinesService,
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
      .withDeleted()
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
    this.applyLoanSearch(qb, query.q);

    qb.orderBy('loan.borrowedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const items = await this.withMembers(rows);
    return { items, total, page, limit };
  }

  async listMine(
    userId: string,
    query: ListLoansQueryDto,
  ): Promise<{ items: Loan[]; total: number; page: number; limit: number }> {
    await this.finesService.accrueOverdueFines(userId);
    return this.list({ ...query, userId });
  }

  countActiveForUser(userId: string): Promise<number> {
    return this.loans.count({ where: { userId, returnedAt: IsNull() } });
  }

  async hasActiveLoanForTitle(userId: string, bookId: string): Promise<boolean> {
    const loan = await this.loans.findOne({
      where: { userId, bookId, returnedAt: IsNull() },
    });
    return Boolean(loan);
  }

  notifyCheckout(loan: Loan): void {
    void this.libraryMail.notifyCheckout(loan);
  }

  async checkoutInTransaction(
    manager: EntityManager,
    dto: { userId: string; bookCopyId: string; dueDate: string },
    staffUserId: string,
    opts: { expectedBookId?: string; maxLoans: number },
  ): Promise<Loan> {
    const copy = await manager
      .getRepository(BookCopy)
      .createQueryBuilder('copy')
      .setLock('pessimistic_write')
      .where('copy.id = :id', { id: dto.bookCopyId })
      .andWhere('copy.deleted_at IS NULL')
      .getOne();

    if (!copy) {
      throw new NotFoundException('Book copy not found');
    }
    if (opts.expectedBookId && copy.bookId !== opts.expectedBookId) {
      throw new BadRequestException('Selected copy does not belong to this title.');
    }
    if (copy.status !== BookCopyStatus.Available) {
      throw new ConflictException('Copy is already on loan or unavailable');
    }

    const alreadyHasTitle = await manager.findOne(Loan, {
      where: { userId: dto.userId, bookId: copy.bookId, returnedAt: IsNull() },
    });
    if (alreadyHasTitle) {
      throw new BadRequestException('Member already has this book on loan.');
    }

    const book = await manager.findOne(Book, {
      where: { id: copy.bookId },
    });
    if (!book || book.deletedAt) {
      throw new NotFoundException('Book not found');
    }

    await manager
      .getRepository(MemberProfile)
      .createQueryBuilder('profile')
      .setLock('pessimistic_write')
      .where('profile.user_id = :userId', { userId: dto.userId })
      .getOne();

    const openLoans = await manager
      .getRepository(Loan)
      .createQueryBuilder('loan')
      .setLock('pessimistic_write')
      .where('loan.user_id = :userId', { userId: dto.userId })
      .andWhere('loan.returned_at IS NULL')
      .getMany();
    if (openLoans.length >= opts.maxLoans) {
      throw new BadRequestException(MEMBER_BORROW_LIMIT_MESSAGE);
    }

    const loan = manager.create(Loan, {
      userId: dto.userId,
      bookCopyId: copy.id,
      bookId: copy.bookId,
      dueDate: dto.dueDate,
      checkedOutBy: staffUserId,
      returnedAt: null,
      returnedTo: null,
    });

    let saved: Loan;
    try {
      saved = await manager.save(loan);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Copy is already on loan');
      }
      throw err;
    }

    copy.status = BookCopyStatus.OnLoan;
    await manager.save(copy);
    return saved;
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loans
      .createQueryBuilder('loan')
      .withDeleted()
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.bookCopy', 'bookCopy')
      .leftJoinAndSelect('loan.fine', 'fine')
      .where('loan.id = :id', { id })
      .getOne();
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    const [withMember] = await this.withMembers([loan]);
    return withMember!;
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
    await this.finesService.accrueOverdueFines();

    const qb = this.loans
      .createQueryBuilder('loan')
      .withDeleted()
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
      const [withMember] = await this.withMembers([loan]);
      return withMember!;
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
      const [withMember] = await this.withMembers([loan]);
      return withMember!;
    }

    const loan = await this.loans.findOne({
      where: { userId: query.userId!, returnedAt: IsNull() },
      relations: { book: true, bookCopy: true, fine: true },
      order: { borrowedAt: 'DESC' },
    });
    if (!loan) {
      throw new NotFoundException('No active loan found');
    }
    const [withMember] = await this.withMembers([loan]);
    return withMember!;
  }

  async checkout(dto: CheckoutLoanDto, staffUserId: string): Promise<Loan> {
    await this.members.requireActiveMember(dto.userId);

    const maxLoans = await this.settings.getMaxActiveLoans();
    const defaultDays = await this.settings.getDefaultLoanDays();
    const dueDate = dto.dueDate?.slice(0, 10) ?? addDaysIso(todayIsoDate(), defaultDays);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedId!: string;
    try {
      const saved = await this.checkoutInTransaction(
        queryRunner.manager,
        { userId: dto.userId, bookCopyId: dto.bookCopyId, dueDate },
        staffUserId,
        { maxLoans },
      );

      const pending = await queryRunner.manager
        .getRepository(CheckoutRequest)
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.user_id = :userId', { userId: dto.userId })
        .andWhere('r.book_id = :bookId', { bookId: saved.bookId })
        .andWhere('r.status = :status', { status: CheckoutRequestStatus.Pending })
        .getOne();

      if (pending) {
        pending.status = CheckoutRequestStatus.Fulfilled;
        pending.loanId = saved.id;
        pending.bookCopyId = saved.bookCopyId;
        pending.issuedBy = staffUserId;
        pending.fulfilledAt = new Date();
        await queryRunner.manager.save(pending);
      }

      await queryRunner.commitTransaction();
      savedId = saved.id;
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }

    const result = await this.findOne(savedId);
    this.notifyCheckout(result);
    return result;
  }

  async returnLoan(
    id: string,
    staffUserId: string,
    input: ReturnLoanDto = {},
  ): Promise<Loan> {
    const fineCentsPerDay = await this.settings.getFineCentsPerDay();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedId!: string;
    let promoted: Reservation | null = null;
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
      await this.settleReturnFine(
        queryRunner.manager,
        loan,
        staffUserId,
        now,
        fineCentsPerDay,
        input.fineSettlement,
      );

      loan.returnedAt = now;
      loan.returnedTo = staffUserId;
      await queryRunner.manager.save(loan);

      copy.status = BookCopyStatus.Available;
      await queryRunner.manager.save(copy);

      promoted = await this.promoteOldestReservation(
        queryRunner.manager.getRepository(Reservation),
        loan.bookId,
      );

      await queryRunner.commitTransaction();
      savedId = loan.id;
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }

    const returned = await this.findOne(savedId);
    void this.libraryMail.notifyReturn(returned);
    if (promoted) {
      void this.libraryMail.notifyReservationAvailable(promoted, returned.book);
    }
    return returned;
  }

  private async settleReturnFine(
    manager: EntityManager,
    loan: Loan,
    staffUserId: string,
    now: Date,
    fineCentsPerDay: number,
    settlement: ReturnLoanDto['fineSettlement'],
  ): Promise<void> {
    const daysOverdue = calendarDaysOverdue(loan.dueDate, now);
    const hasDue = daysOverdue > 0 && fineCentsPerDay > 0;
    if (!hasDue) return;

    const existing = await manager.findOne(Fine, { where: { loanId: loan.id } });
    if (existing?.status === FineStatus.Paid || existing?.status === FineStatus.Waived) {
      return;
    }

    if (settlement !== 'paid' && settlement !== 'unpaid') {
      throw new BadRequestException(OVERDUE_RETURN_SETTLEMENT_MESSAGE);
    }

    const amountCents = daysOverdue * fineCentsPerDay;
    const paid = settlement === 'paid';
    if (!existing) {
      const fine = manager.create(Fine, {
        loanId: loan.id,
        userId: loan.userId,
        daysOverdue,
        amountCents,
        status: paid ? FineStatus.Paid : FineStatus.Unpaid,
        paidAt: paid ? now : null,
        markedPaidBy: paid ? staffUserId : null,
      });
      try {
        await manager.save(fine);
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
        const raced = await manager.findOne(Fine, { where: { loanId: loan.id } });
        if (raced && raced.status === FineStatus.Unpaid) {
          raced.daysOverdue = daysOverdue;
          raced.amountCents = amountCents;
          if (paid) {
            raced.status = FineStatus.Paid;
            raced.paidAt = now;
            raced.markedPaidBy = staffUserId;
          }
          await manager.save(raced);
        }
      }
      return;
    }

    existing.daysOverdue = daysOverdue;
    existing.amountCents = amountCents;
    if (paid) {
      existing.status = FineStatus.Paid;
      existing.paidAt = now;
      existing.markedPaidBy = staffUserId;
    }
    await manager.save(existing);
  }

  /** FIFO: fulfill oldest active reservation and renumber remaining queue. */
  private async promoteOldestReservation(
    repo: Repository<Reservation>,
    bookId: string,
  ): Promise<Reservation | null> {
    const oldest = await repo
      .createQueryBuilder('r')
      .setLock('pessimistic_write')
      .where('r.book_id = :bookId', { bookId })
      .andWhere('r.status = :status', { status: ReservationStatus.Active })
      .orderBy('r.created_at', 'ASC')
      .getOne();

    if (!oldest) return null;

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
    return oldest;
  }

  async sendOverdueNotice(id: string): Promise<Loan> {
    const outcome = await this.sendOverdueNoticeForLoan(id, { accrueFine: true });
    if (outcome.status === 'sent' || outcome.status === 'skipped') {
      if (outcome.reason === 'cooldown') {
        throw new ConflictException(
          'An overdue reminder was already sent in the last 24 hours.',
        );
      }
      return this.findOne(id);
    }
    if (outcome.reason === 'invalid') {
      throw new BadRequestException('Loan is not overdue or has already been returned.');
    }
    throw new ServiceUnavailableException(
      'Could not send the overdue reminder. Please try again.',
    );
  }

  async sendOverdueNotices(): Promise<OverdueNoticeBulkResult> {
    await this.finesService.accrueOverdueFines();
    const today = todayIsoDate();
    const overdue = await this.loans
      .createQueryBuilder('loan')
      .withDeleted()
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.bookCopy', 'bookCopy')
      .leftJoinAndSelect('loan.fine', 'fine')
      .where('loan.returned_at IS NULL')
      .andWhere('loan.due_date < :today', { today })
      .orderBy('loan.due_date', 'ASC')
      .getMany();

    const summary: OverdueNoticeBulkResult = { sent: 0, skipped: 0, failed: 0 };
    for (const loan of overdue) {
      try {
        const outcome = await this.sendOverdueNoticeForLoan(loan, {
          accrueFine: false,
        });
        summary[outcome.status] += 1;
      } catch {
        summary.failed += 1;
      }
    }
    return summary;
  }

  private async sendOverdueNoticeForLoan(
    loanOrId: Loan | string,
    opts: { accrueFine: boolean },
  ): Promise<OverdueNoticeOutcome> {
    const id = typeof loanOrId === 'string' ? loanOrId : loanOrId.id;
    try {
      if (opts.accrueFine) {
        const userId =
          typeof loanOrId === 'string' ? undefined : loanOrId.userId;
        const knownUserId =
          userId ??
          (await this.loans.findOne({ where: { id } }))?.userId;
        if (knownUserId) {
          await this.finesService.accrueOverdueFines(knownUserId);
        }
      }

      const loan = await this.loadLoanForNotice(id);
      if (!loan || loan.returnedAt) {
        return { status: 'failed', reason: 'invalid' };
      }
      if (calendarDaysOverdue(toDueDateIso(loan.dueDate), new Date()) <= 0) {
        return { status: 'failed', reason: 'invalid' };
      }

      if (isWithinOverdueCooldown(loan.overdueNotifiedAt)) {
        return { status: 'skipped', reason: 'cooldown' };
      }

      const result = await this.libraryMail.notifyOverdue(loan);
      if (result === 'failed') {
        return { status: 'failed', reason: 'smtp' };
      }

      await this.loans.update(id, { overdueNotifiedAt: new Date() });
      if (result === 'skipped') {
        return { status: 'skipped', reason: 'no_email' };
      }
      return { status: 'sent' };
    } catch (err) {
      this.logger.error(
        `Overdue notice failed loanId=${id}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return { status: 'failed', reason: 'smtp' };
    }
  }

  private async loadLoanForNotice(id: string): Promise<Loan | null> {
    return this.loans
      .createQueryBuilder('loan')
      .withDeleted()
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.bookCopy', 'bookCopy')
      .leftJoinAndSelect('loan.fine', 'fine')
      .where('loan.id = :id', { id })
      .getOne();
  }

  private applyLoanSearch(
    qb: ReturnType<Repository<Loan>['createQueryBuilder']>,
    q?: string,
  ): void {
    const term = q?.trim();
    if (!term) return;
    qb.leftJoin(MemberProfile, 'memberSearch', 'memberSearch.user_id = loan.user_id');
    qb.andWhere(
      '(memberSearch.full_name ILIKE :q OR memberSearch.email ILIKE :q OR book.title ILIKE :q OR bookCopy.barcode ILIKE :q)',
      { q: `%${term}%` },
    );
  }

  private async withMembers<T extends Loan>(rows: T[]): Promise<T[]> {
    if (rows.length === 0) return rows;
    const userIds = [...new Set(rows.map((row) => row.userId))];
    const profiles = await this.memberProfiles.find({ where: { userId: In(userIds) } });
    const byUser = new Map(profiles.map((profile) => [profile.userId, profile]));
    return rows.map((row) => {
      const profile = byUser.get(row.userId);
      if (profile) {
        Object.assign(row, {
          member: { fullName: profile.fullName, email: profile.email },
        });
      }
      return row;
    });
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

function isWithinOverdueCooldown(notifiedAt: Date | string | null | undefined): boolean {
  if (notifiedAt == null || notifiedAt === '') return false;
  const at = notifiedAt instanceof Date ? notifiedAt : new Date(notifiedAt);
  if (Number.isNaN(at.getTime())) return false;
  return Date.now() - at.getTime() < OVERDUE_NOTICE_COOLDOWN_MS;
}

function toDueDateIso(dueDate: string | Date): string {
  if (dueDate instanceof Date) {
    return dueDate.toISOString().slice(0, 10);
  }
  const raw = String(dueDate);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw.slice(0, 10) : parsed.toISOString().slice(0, 10);
}
