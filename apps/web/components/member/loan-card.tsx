import Link from 'next/link';
import type { Book } from '@shared/types';
import { bookDetailPath } from '@/lib/auth/routes';
import { formatDueDate, getLoanDueStatus } from '@/lib/member';
import { BookCover } from './book-cover';
import { StatusChip } from './status-chip';

type LoanLike = {
  id: string;
  bookId: string;
  dueDate: string;
  overdue?: boolean;
  returnedAt?: string | null;
  book: Pick<Book, 'title' | 'author'>;
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

  return (
    <article className="member-card flex items-start gap-3 p-4">
      <BookCover title={loan.book.title} size="sm" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="m-0 truncate text-sm font-semibold text-[color:var(--bookly-navy)]">
              {loan.book.title}
            </h3>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              {loan.book.author}
            </p>
          </div>
          <StatusChip tone={status.tone}>{status.label}</StatusChip>
        </div>
        <p className="mt-2 mb-0 text-sm text-[color:var(--bookly-muted)]">
          Due {formatDueDate(loan.dueDate)}
        </p>
        {loan.fine && loan.fine.status === 'unpaid' ? (
          <p className="mt-1 mb-0 text-sm text-[color:#991b1b]">
            Fine on this loan — view My Fines for details
          </p>
        ) : null}
        {showDetailsLink ? (
          <div className="mt-3">
            <Link
              href={bookDetailPath(loan.bookId)}
              className="text-sm font-medium text-[color:var(--bookly-navy)] no-underline hover:underline"
            >
              View details →
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
