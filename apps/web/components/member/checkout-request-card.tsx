import Link from 'next/link';
import type { Book, CheckoutRequestStatus } from '@shared/types';
import { Button } from '@shared/ui/components';
import { bookDetailPath } from '@/lib/auth/routes';
import { formatDateTime, formatDueDate } from '@/lib/member';
import { BookCover } from './book-cover';
import { StatusChip } from './status-chip';

type CheckoutRequestLike = {
  id: string;
  bookId: string;
  status: CheckoutRequestStatus;
  createdAt: string;
  book: Pick<Book, 'title' | 'author'> & { isbn?: string };
  loan?: { borrowedAt: string; dueDate: string } | null;
};

function statusTone(
  status: CheckoutRequestStatus,
): 'healthy' | 'available' | 'neutral' | 'rejected' {
  if (status === 'fulfilled') return 'healthy';
  if (status === 'pending') return 'available';
  if (status === 'rejected') return 'rejected';
  return 'neutral';
}

function statusLabel(status: CheckoutRequestStatus): string {
  if (status === 'fulfilled') return 'Book Issued';
  if (status === 'pending') return 'Pending';
  if (status === 'cancelled') return 'Cancelled';
  return 'Rejected';
}

export function CheckoutRequestCard({
  request,
  onCancel,
  cancelPending,
}: Readonly<{
  request: CheckoutRequestLike;
  onCancel?: (request: CheckoutRequestLike) => void;
  cancelPending?: boolean;
}>) {
  const canCancel = request.status === 'pending' && Boolean(onCancel);
  const issued = request.status === 'fulfilled' && request.loan;

  return (
    <article className="member-card member-list-card">
      <BookCover title={request.book.title} size="sm" />
      <div className="member-list-card-body">
        <div className="member-list-card-top">
          <div className="member-list-card-copy">
            <h3 className="m-0 truncate text-sm font-semibold text-[color:var(--bookly-navy)]">
              {request.book.title}
            </h3>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              {request.book.author}
            </p>
          </div>
          <StatusChip tone={statusTone(request.status)}>
            {statusLabel(request.status)}
          </StatusChip>
        </div>

        <div className="space-y-1">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
            Request
          </p>
          <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
            Requested {formatDateTime(request.createdAt)}
          </p>
          {request.status === 'pending' ? (
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              Waiting for a librarian to issue a copy.
            </p>
          ) : null}
        </div>

        {issued ? (
          <div className="space-y-1">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
              Loan
            </p>
            <p className="m-0 text-sm text-[color:var(--bookly-navy)]">
              Issued {formatDueDate(request.loan!.borrowedAt)} · Due{' '}
              {formatDueDate(request.loan!.dueDate)}
            </p>
          </div>
        ) : null}

        <div className="member-list-card-actions">
          <Link href={bookDetailPath(request.bookId)} className="member-inline-link">
            View details →
          </Link>
          {canCancel ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={cancelPending}
              loading={cancelPending}
              loadingText="Cancelling…"
              onClick={() => onCancel?.(request)}
            >
              Cancel Request
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
