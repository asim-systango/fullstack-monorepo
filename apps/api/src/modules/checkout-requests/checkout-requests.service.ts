import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, QueryFailedError, Repository } from 'typeorm';
import { addDaysIso, todayIsoDate } from '../../common/iso-date';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { BookCopyStatus } from '../books/enums/book-copy-status.enum';
import { MEMBER_BORROW_LIMIT_MESSAGE } from '../loans/borrow-limit';
import { LoansService } from '../loans/loans.service';
import { MemberProfile } from '../members/member-profile.entity';
import { MembersService } from '../members/members.service';
import { SettingsService } from '../settings/settings.service';
import { CheckoutRequest } from './checkout-request.entity';
import type { CreateCheckoutRequestDto } from './dto/create-checkout-request.dto';
import type { IssueCheckoutRequestDto } from './dto/issue-checkout-request.dto';
import type { ListCheckoutRequestsQueryDto } from './dto/list-checkout-requests-query.dto';
import type { RejectCheckoutRequestDto } from './dto/reject-checkout-request.dto';
import { CheckoutRequestStatus } from './enums/checkout-request-status.enum';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

export type CheckoutRequestMember = {
  userId: string;
  fullName: string;
  email: string;
  status: MemberProfile['status'];
};

export type CheckoutRequestView = CheckoutRequest & {
  member?: CheckoutRequestMember;
  suggestedDueDate?: string;
};

@Injectable()
export class CheckoutRequestsService {
  constructor(
    @InjectRepository(CheckoutRequest)
    private readonly requests: Repository<CheckoutRequest>,
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
    @InjectRepository(MemberProfile)
    private readonly profiles: Repository<MemberProfile>,
    private readonly members: MembersService,
    private readonly settings: SettingsService,
    private readonly loans: LoansService,
    private readonly dataSource: DataSource,
  ) {}

  async list(
    query: ListCheckoutRequestsQueryDto,
    opts?: { defaultPending?: boolean },
  ): Promise<{
    items: CheckoutRequestView[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.requests
      .createQueryBuilder('r')
      .withDeleted()
      .leftJoinAndSelect('r.book', 'book')
      .leftJoinAndSelect('r.loan', 'loan');

    if (query.userId) {
      qb.andWhere('r.user_id = :userId', { userId: query.userId });
    }
    if (query.bookId) {
      qb.andWhere('r.book_id = :bookId', { bookId: query.bookId });
    }
    const status =
      query.status ?? (opts?.defaultPending ? CheckoutRequestStatus.Pending : undefined);
    if (status) {
      qb.andWhere('r.status = :status', { status });
    }
    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`;
      qb.leftJoin(MemberProfile, 'memberSearch', 'memberSearch.user_id = r.user_id');
      qb.andWhere(
        '(memberSearch.full_name ILIKE :q OR memberSearch.email ILIKE :q OR book.title ILIKE :q)',
        { q },
      );
    }

    qb.orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const items = await this.withMembers(rows);
    return { items, total, page, limit };
  }

  listMine(userId: string, query: ListCheckoutRequestsQueryDto) {
    return this.list({ ...query, userId }, { defaultPending: false });
  }

  async findOne(id: string, opts?: { includeSuggestedDueDate?: boolean }): Promise<CheckoutRequestView> {
    const row = await this.requests.findOne({
      where: { id },
      relations: { book: true, loan: true },
    });
    if (!row) {
      throw new NotFoundException('Checkout request not found');
    }
    const [withMember] = await this.withMembers([row]);
    const view = withMember!;
    if (opts?.includeSuggestedDueDate) {
      const days = await this.settings.getDefaultLoanDays();
      view.suggestedDueDate = addDaysIso(todayIsoDate(), days);
    }
    return view;
  }

  async create(userId: string, dto: CreateCheckoutRequestDto): Promise<CheckoutRequestView> {
    await this.members.requireActiveMember(userId);

    const book = await this.books.findOne({ where: { id: dto.bookId } });
    if (!book || book.deletedAt) {
      throw new NotFoundException('Book not found');
    }

    const availableCount = await this.copies.count({
      where: {
        bookId: dto.bookId,
        status: BookCopyStatus.Available,
        deletedAt: IsNull(),
      },
    });
    if (availableCount <= 0) {
      throw new BadRequestException(
        'No copies are available. Reserve this book instead.',
      );
    }

    const activeLoan = await this.loans.hasActiveLoanForTitle(userId, dto.bookId);
    if (activeLoan) {
      throw new BadRequestException('You already have this book on loan.');
    }

    const maxLoans = await this.settings.getMaxActiveLoans();
    const activeCount = await this.loans.countActiveForUser(userId);
    if (activeCount >= maxLoans) {
      throw new BadRequestException(MEMBER_BORROW_LIMIT_MESSAGE);
    }

    try {
      const saved = await this.requests.save(
        this.requests.create({
          userId,
          bookId: dto.bookId,
          status: CheckoutRequestStatus.Pending,
        }),
      );
      return this.findOne(saved.id);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(
          'You already have a pending checkout request for this book.',
        );
      }
      throw err;
    }
  }

  async cancel(id: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager
        .getRepository(CheckoutRequest)
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.id = :id', { id })
        .getOne();

      if (!request) {
        throw new NotFoundException('Checkout request not found');
      }
      if (request.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own checkout request');
      }
      this.assertPending(request);

      request.status = CheckoutRequestStatus.Cancelled;
      request.cancelledAt = new Date();
      await queryRunner.manager.save(request);
      await queryRunner.commitTransaction();
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async issue(
    id: string,
    staffUserId: string,
    dto: IssueCheckoutRequestDto,
  ): Promise<CheckoutRequestView> {
    const maxLoans = await this.settings.getMaxActiveLoans();
    const defaultDays = await this.settings.getDefaultLoanDays();
    const dueDate = dto.dueDate?.slice(0, 10) ?? addDaysIso(todayIsoDate(), defaultDays);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let loanId!: string;
    try {
      const request = await queryRunner.manager
        .getRepository(CheckoutRequest)
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.id = :id', { id })
        .getOne();

      if (!request) {
        throw new NotFoundException('Checkout request not found');
      }
      this.assertPending(request);

      await this.members.requireActiveMember(request.userId);

      const loan = await this.loans.checkoutInTransaction(
        queryRunner.manager,
        {
          userId: request.userId,
          bookCopyId: dto.bookCopyId,
          dueDate,
        },
        staffUserId,
        { expectedBookId: request.bookId, maxLoans },
      );

      request.status = CheckoutRequestStatus.Fulfilled;
      request.loanId = loan.id;
      request.bookCopyId = loan.bookCopyId;
      request.issuedBy = staffUserId;
      request.fulfilledAt = new Date();
      await queryRunner.manager.save(request);

      await queryRunner.commitTransaction();
      loanId = loan.id;
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }

    const issued = await this.loans.findOne(loanId);
    void this.loans.notifyCheckout(issued);
    return this.findOne(id);
  }

  async reject(id: string, dto: RejectCheckoutRequestDto): Promise<CheckoutRequestView> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager
        .getRepository(CheckoutRequest)
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.id = :id', { id })
        .getOne();

      if (!request) {
        throw new NotFoundException('Checkout request not found');
      }
      this.assertPending(request);

      request.status = CheckoutRequestStatus.Rejected;
      request.rejectedAt = new Date();
      request.rejectedReason = dto.reason?.trim() || null;
      await queryRunner.manager.save(request);
      await queryRunner.commitTransaction();
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(id);
  }

  private assertPending(request: CheckoutRequest): void {
    if (request.status === CheckoutRequestStatus.Pending) return;
    if (request.status === CheckoutRequestStatus.Fulfilled) {
      throw new BadRequestException('This request has already been fulfilled.');
    }
    if (request.status === CheckoutRequestStatus.Cancelled) {
      throw new BadRequestException('This request has been cancelled.');
    }
    if (request.status === CheckoutRequestStatus.Rejected) {
      throw new BadRequestException('This request has already been rejected.');
    }
    throw new BadRequestException('Request is not pending.');
  }

  private async withMembers(rows: CheckoutRequest[]): Promise<CheckoutRequestView[]> {
    if (rows.length === 0) return [];
    const userIds = [...new Set(rows.map((row) => row.userId))];
    const profiles = await this.profiles.find({ where: { userId: In(userIds) } });
    const byUser = new Map(profiles.map((profile) => [profile.userId, profile]));
    return rows.map((row) => {
      const profile = byUser.get(row.userId);
      const view = row as CheckoutRequestView;
      if (profile) {
        view.member = {
          userId: profile.userId,
          fullName: profile.fullName,
          email: profile.email,
          status: profile.status,
        };
      }
      return view;
    });
  }
}
