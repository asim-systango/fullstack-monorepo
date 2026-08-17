import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { calendarDaysOverdue } from '../../common/iso-date';
import { Book } from '../books/book.entity';
import type { Loan } from '../loans/loan.entity';
import { MembersService } from '../members/members.service';
import type { Reservation } from '../reservations/reservation.entity';
import { MailerService, type LibraryMailResult } from './mailer.service';
import type { LibraryEmailKind } from './templates/library-email';

@Injectable()
export class LibraryNotificationsService {
  private readonly logger = new Logger(LibraryNotificationsService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly members: MembersService,
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
  ) {}

  async notifyCheckout(loan: Loan): Promise<void> {
    await this.notifyLoan(loan, 'checkout');
  }

  async notifyReturn(loan: Loan): Promise<void> {
    await this.notifyLoan(loan, 'return');
  }

  async notifyDueReminder(loan: Loan): Promise<LibraryMailResult> {
    return this.notifyLoan(loan, 'due_reminder');
  }

  async notifyOverdue(loan: Loan): Promise<LibraryMailResult> {
    return this.notifyLoan(loan, 'overdue');
  }

  async notifyReservationAvailable(
    reservation: Reservation,
    book: Book | null | undefined,
  ): Promise<void> {
    try {
      const recipient = await this.members.resolveMailRecipient(reservation.userId);
      if (!recipient) {
        this.logger.warn(
          `Reservation available notice skipped: no email userId=${reservation.userId}`,
        );
        return;
      }
      const title = await this.resolveBookTitle(book, reservation.bookId);
      await this.mailer.sendLibraryEmail(recipient.to, {
        kind: 'reservation_available',
        memberName: recipient.name,
        bookTitle: title,
      });
    } catch (err) {
      this.logger.error(
        `Reservation available notice failed reservationId=${reservation.id}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private async notifyLoan(loan: Loan, kind: LibraryEmailKind): Promise<LibraryMailResult> {
    try {
      const recipient = await this.members.resolveMailRecipient(loan.userId);
      if (!recipient) {
        this.logger.warn(
          `Library notice skipped: no email kind=${kind} loanId=${loan.id} userId=${loan.userId}`,
        );
        return 'skipped';
      }
      const title = await this.resolveBookTitle(loan.book, loan.bookId);
      const fineCents = loan.fine?.amountCents;
      const includeFine =
        (kind === 'return' || kind === 'overdue') &&
        fineCents != null &&
        fineCents > 0;
      const overdueDays =
        kind === 'overdue'
          ? calendarDaysOverdue(toIsoDay(loan.dueDate) ?? String(loan.dueDate), new Date())
          : undefined;
      return await this.mailer.sendLibraryEmail(recipient.to, {
        kind,
        memberName: recipient.name,
        bookTitle: title,
        issuedAt:
          kind === 'checkout' ? toIsoDay(loan.borrowedAt) : undefined,
        dueDate: kind === 'return' ? undefined : toIsoDay(loan.dueDate) ?? undefined,
        returnedAt: kind === 'return' ? toIsoDay(loan.returnedAt) : undefined,
        overdueDays:
          overdueDays != null && overdueDays > 0 ? overdueDays : undefined,
        fineAmountLabel:
          includeFine && fineCents != null ? formatInrCents(fineCents) : undefined,
      });
    } catch (err) {
      this.logger.error(
        `Library notice failed kind=${kind} loanId=${loan.id}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return 'failed';
    }
  }

  private async resolveBookTitle(
    book: Book | null | undefined,
    bookId?: string | null,
  ): Promise<string> {
    if (book?.title) return book.title;
    if (!bookId) return 'Library title';
    const loaded = await this.books.findOne({
      where: { id: bookId },
      withDeleted: true,
    });
    return loaded?.title ?? 'Library title';
  }
}

function toIsoDay(value: Date | string | null | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString().slice(0, 10);
  }
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

function formatInrCents(cents: number): string {
  return `INR ${(cents / 100).toFixed(2)}`;
}
