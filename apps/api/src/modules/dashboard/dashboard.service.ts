import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { BookCopyStatus } from '../books/enums/book-copy-status.enum';
import { CheckoutRequest } from '../checkout-requests/checkout-request.entity';
import { CheckoutRequestStatus } from '../checkout-requests/enums/checkout-request-status.enum';
import { Fine } from '../fines/fine.entity';
import { FineStatus } from '../fines/enums/fine-status.enum';
import { FinesService } from '../fines/fines.service';
import { Loan } from '../loans/loan.entity';
import { MemberProfile } from '../members/member-profile.entity';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { SettingsService } from '../settings/settings.service';
import { User } from '../users/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
    @InjectRepository(Fine)
    private readonly fines: Repository<Fine>,
    @InjectRepository(MemberProfile)
    private readonly members: Repository<MemberProfile>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(CheckoutRequest)
    private readonly checkoutRequests: Repository<CheckoutRequest>,
    private readonly settings: SettingsService,
    private readonly finesService: FinesService,
  ) {}

  /** Row counts from `book` / `book_copy`, including soft-deleted titles. */
  private async inventoryCounts() {
    const [totalBooks, totalCopies, availableCopies] = await Promise.all([
      this.books.createQueryBuilder('book').withDeleted().getCount(),
      this.copies.createQueryBuilder('copy').withDeleted().getCount(),
      this.copies
        .createQueryBuilder('copy')
        .withDeleted()
        .where('copy.status = :status', { status: BookCopyStatus.Available })
        .getCount(),
    ]);
    return { totalBooks, totalCopies, availableCopies };
  }

  async publicStats() {
    const [totalTitles, availableCopies] = await Promise.all([
      this.books.count({ where: { deletedAt: IsNull() } }),
      this.copies.count({
        where: { status: BookCopyStatus.Available, deletedAt: IsNull() },
      }),
    ]);
    return { totalTitles, availableCopies };
  }

  async memberDashboard(userId: string) {
    await this.finesService.accrueOverdueFines(userId);
    const today = new Date().toISOString().slice(0, 10);
    const [activeLoans, reservations, outstandingRaw, maxActiveLoans] = await Promise.all([
      this.loans
        .createQueryBuilder('loan')
        .withDeleted()
        .leftJoinAndSelect('loan.book', 'book')
        .leftJoinAndSelect('loan.bookCopy', 'bookCopy')
        .leftJoinAndSelect('loan.fine', 'fine')
        .where('loan.user_id = :userId', { userId })
        .andWhere('loan.returned_at IS NULL')
        .orderBy('loan.due_date', 'ASC')
        .take(20)
        .getMany(),
      this.reservations
        .createQueryBuilder('r')
        .withDeleted()
        .leftJoinAndSelect('r.book', 'book')
        .where('r.user_id = :userId', { userId })
        .andWhere('r.status = :status', { status: ReservationStatus.Active })
        .orderBy('r.created_at', 'ASC')
        .take(20)
        .getMany(),
      this.fines
        .createQueryBuilder('fine')
        .select('COALESCE(SUM(fine.amount_cents), 0)', 'total')
        .where('fine.user_id = :userId', { userId })
        .andWhere('fine.status = :status', { status: FineStatus.Unpaid })
        .getRawOne<{ total: string }>(),
      this.settings.getMaxActiveLoans(),
    ]);

    return {
      activeLoans: activeLoans.map((loan) => ({
        ...loan,
        overdue: loan.dueDate < today,
      })),
      reservations,
      outstandingFineTotalCents: Number(outstandingRaw?.total ?? 0),
      maxActiveLoans,
    };
  }

  async librarianDashboard() {
    const today = new Date().toISOString().slice(0, 10);
    const [
      inventory,
      activeLoans,
      overdueLoans,
      memberCount,
    ] = await Promise.all([
      this.inventoryCounts(),
      this.loans.count({ where: { returnedAt: IsNull() } }),
      this.loans
        .createQueryBuilder('loan')
        .where('loan.returned_at IS NULL')
        .andWhere('loan.due_date < :today', { today })
        .getCount(),
      this.members.count(),
    ]);

    return {
      ...inventory,
      activeLoans,
      overdueLoans,
      memberCount,
    };
  }

  async adminDashboard() {
    const today = new Date().toISOString().slice(0, 10);
    const [
      memberCount,
      librarianCount,
      activeLoans,
      overdueLoans,
      maxActiveLoans,
      inventory,
      pendingCheckoutRequests,
    ] = await Promise.all([
      this.members.count(),
      this.users.count({ where: { role: 'staff' } }),
      this.loans.count({ where: { returnedAt: IsNull() } }),
      this.loans
        .createQueryBuilder('loan')
        .where('loan.returned_at IS NULL')
        .andWhere('loan.due_date < :today', { today })
        .getCount(),
      this.settings.getMaxActiveLoans(),
      this.inventoryCounts(),
      this.checkoutRequests.count({
        where: { status: CheckoutRequestStatus.Pending },
      }),
    ]);

    return {
      memberCount,
      librarianCount,
      activeLoans,
      overdueLoans,
      maxActiveLoans,
      ...inventory,
      pendingCheckoutRequests,
    };
  }
}
