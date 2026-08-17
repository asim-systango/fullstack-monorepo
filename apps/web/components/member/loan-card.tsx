import Link from 'next/link';
import type { Book } from '@shared/types';
import { bookDetailPath } from '@/lib/auth/routes';
import { formatDueDate, formatMoneyInr, getLoanDueStatus } from '@/lib/member';
import { BookCover } from './book-cover';
import { StatusChip } from './status-chip';

type LoanLike = {
  id: string;
  bookId: string;
  dueDate: string;
  overdue?: boolean;
  returnedAt?: string | null;
  book: Pick<Book, 'title' | 'author'> & { isbn?: string };
  fine?: { amountCents: number; status: string } | null;
};

export function LoanCard({
  loan,
  showDetailsLink = true,
}: Readonly<{ loan: LoanLike; showDetailsLink?: boolean }>) {
  const returned = Boolean(loan.returnedAt);
  const status = returned
    ? { tone: 'neutral' as const, label: 'Returned' }
    : getLoanDueStatus(loan.dueDate, loan.overdue);
  const dateLabel = returned
    ? `Returned ${formatDueDate(loan.returnedAt!)}`
    : `Due ${formatDueDate(loan.dueDate)}`;

  return (
    <article className="member-card member-list-card">
      <BookCover title={loan.book.title} size="sm" />
      <div className="member-list-card-body">
        <div className="member-list-card-top">
          <div className="member-list-card-copy">
            <h3 className="m-0 truncate text-sm font-semibold text-[color:var(--bookly-navy)]">
              {loan.book.title}
            </h3>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              {loan.book.author}
            </p>
          </div>
          <StatusChip tone={status.tone}>{status.label}</StatusChip>
        </div>
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">{dateLabel}</p>
        {loan.fine && loan.fine.status === 'unpaid' ? (
          <p className="m-0 text-sm text-[color:#991b1b]">
            Fine {formatMoneyInr(loan.fine.amountCents)} — see My Fines
          </p>
        ) : null}
        {showDetailsLink ? (
          <div className="member-list-card-actions">
            <Link href={bookDetailPath(loan.bookId)} className="member-inline-link">
              View details →
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
