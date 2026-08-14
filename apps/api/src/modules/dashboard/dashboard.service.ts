import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { BookCopyStatus } from '../books/enums/book-copy-status.enum';
import { Fine } from '../fines/fine.entity';
import { FineStatus } from '../fines/enums/fine-status.enum';
import { Loan } from '../loans/loan.entity';
import { MemberProfile } from '../members/member-profile.entity';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { SettingsService } from '../settings/settings.service';

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
    private readonly settings: SettingsService,
  ) {}

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
    const today = new Date().toISOString().slice(0, 10);
    const [activeLoans, reservations, outstandingRaw] = await Promise.all([
      this.loans.find({
        where: { userId, returnedAt: IsNull() },
        relations: { book: true, bookCopy: true },
        order: { dueDate: 'ASC' },
        take: 20,
      }),
      this.reservations.find({
        where: { userId, status: ReservationStatus.Active },
        relations: { book: true },
        order: { createdAt: 'ASC' },
        take: 20,
      }),
      this.fines
        .createQueryBuilder('fine')
        .select('COALESCE(SUM(fine.amount_cents), 0)', 'total')
        .where('fine.user_id = :userId', { userId })
        .andWhere('fine.status = :status', { status: FineStatus.Unpaid })
        .getRawOne<{ total: string }>(),
    ]);

    return {
      activeLoans: activeLoans.map((loan) => ({
        ...loan,
        overdue: loan.dueDate < today,
      })),
      reservations,
      outstandingFineTotalCents: Number(outstandingRaw?.total ?? 0),
    };
  }

  async librarianDashboard() {
    const today = new Date().toISOString().slice(0, 10);
    const [totalBooks, totalCopies, activeLoans, overdueLoans] = await Promise.all([
      this.books.count({ where: { deletedAt: IsNull() } }),
      this.copies.count({ where: { deletedAt: IsNull() } }),
      this.loans.count({ where: { returnedAt: IsNull() } }),
      this.loans
        .createQueryBuilder('loan')
        .where('loan.returned_at IS NULL')
        .andWhere('loan.due_date < :today', { today })
        .getCount(),
    ]);

    return { totalBooks, totalCopies, activeLoans, overdueLoans };
  }

  async adminDashboard() {
    const today = new Date().toISOString().slice(0, 10);
    const [memberCount, activeLoans, overdueLoans, maxActiveLoans] = await Promise.all([
      this.members.count(),
      this.loans.count({ where: { returnedAt: IsNull() } }),
      this.loans
        .createQueryBuilder('loan')
        .where('loan.returned_at IS NULL')
        .andWhere('loan.due_date < :today', { today })
        .getCount(),
      this.settings.getMaxActiveLoans(),
    ]);

    return { memberCount, activeLoans, overdueLoans, maxActiveLoans };
  }
}
