import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { toIsoDay } from '../../common/iso-date';
import { CheckoutRequest } from '../checkout-requests/checkout-request.entity';
import { CheckoutRequestStatus } from '../checkout-requests/enums/checkout-request-status.enum';
import { Loan } from '../loans/loan.entity';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { SettingsService } from '../settings/settings.service';
import { BooksService } from './books.service';

export type BookViewerActions = {
  available: boolean;
  availableCopies: number;
  totalCopies: number;
  maxActiveLoans: number;
  activeLoanCount: number;
  atBorrowLimit: boolean;
  ownLoan: { id: string; dueDate: string } | null;
  ownReservation: { id: string; queuePosition: number | null } | null;
  pendingRequest: { id: string } | null;
  canRequestCheckout: boolean;
  canReserve: boolean;
};

@Injectable()
export class BookActionsService {
  constructor(
    private readonly books: BooksService,
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
    @InjectRepository(CheckoutRequest)
    private readonly checkoutRequests: Repository<CheckoutRequest>,
    private readonly settings: SettingsService,
  ) {}

  async getMine(userId: string, bookId: string): Promise<BookViewerActions> {
    const book = await this.books.findOne(bookId);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const [ownLoan, ownReservation, pendingRequest, activeLoanCount, maxActiveLoans] =
      await Promise.all([
        this.loans.findOne({
          where: { userId, bookId, returnedAt: IsNull() },
        }),
        this.reservations.findOne({
          where: { userId, bookId, status: ReservationStatus.Active },
        }),
        this.checkoutRequests.findOne({
          where: { userId, bookId, status: CheckoutRequestStatus.Pending },
        }),
        this.loans.count({ where: { userId, returnedAt: IsNull() } }),
        this.settings.getMaxActiveLoans(),
      ]);

    const available = book.availableCopies > 0;
    const atBorrowLimit = activeLoanCount >= maxActiveLoans;
    const canRequestCheckout =
      available && !ownLoan && !pendingRequest && !atBorrowLimit;
    const canReserve = !available && !ownLoan && !ownReservation && !pendingRequest;

    return {
      available,
      availableCopies: book.availableCopies,
      totalCopies: book.totalCopies,
      maxActiveLoans,
      activeLoanCount,
      atBorrowLimit,
      ownLoan: ownLoan
        ? { id: ownLoan.id, dueDate: toIsoDay(ownLoan.dueDate) }
        : null,
      ownReservation: ownReservation
        ? { id: ownReservation.id, queuePosition: ownReservation.queuePosition }
        : null,
      pendingRequest: pendingRequest ? { id: pendingRequest.id } : null,
      canRequestCheckout,
      canReserve,
    };
  }
}
