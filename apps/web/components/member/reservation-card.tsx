import Link from 'next/link';
import type { Book } from '@shared/types';
import { Button } from '@shared/ui/components';
import { bookDetailPath } from '@/lib/auth/routes';
import { formatShortDate } from '@/lib/member';
import { BookCover } from './book-cover';
import { StatusChip } from './status-chip';

type ReservationLike = {
  id: string;
  bookId: string;
  status: string;
  queuePosition: number | null;
  createdAt: string;
  book: Pick<Book, 'title' | 'author'> & { isbn?: string };
};

function statusLabel(status: string): string {
  if (status === 'active') return 'Active';
  if (status === 'fulfilled') return 'Fulfilled';
  if (status === 'cancelled') return 'Cancelled';
  return status;
}

export function ReservationCard({
  reservation,
  onCancel,
  cancelPending,
}: Readonly<{
  reservation: ReservationLike;
  onCancel?: (reservation: ReservationLike) => void;
  cancelPending?: boolean;
}>) {
  const position = reservation.queuePosition;
  const ahead = position != null && position > 1 ? position - 1 : 0;
  const canCancel = reservation.status === 'active' && Boolean(onCancel);

  let queueHint = 'You are next in line';
  if (ahead === 1) queueHint = '1 reader ahead of you';
  else if (ahead > 1) queueHint = `${ahead} readers ahead of you`;

  return (
    <article className="member-card member-reservation-card">
      <BookCover title={reservation.book.title} size="sm" />
      <div className="member-reservation-body">
        <div className="member-list-card-top">
          <div className="member-list-card-copy">
            <h3 className="m-0 truncate text-sm font-semibold text-[color:var(--bookly-navy)]">
              {reservation.book.title}
            </h3>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              {reservation.book.author}
            </p>
          </div>
          <StatusChip tone={reservation.status === 'active' ? 'available' : 'neutral'}>
            {statusLabel(reservation.status)}
          </StatusChip>
        </div>

        {position != null ? (
          <div className="member-reservation-queue">
            <p className="member-queue">#{position} in queue</p>
            <p className="member-queue-hint">{queueHint}</p>
          </div>
        ) : null}

        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
          Reserved {formatShortDate(reservation.createdAt)}
        </p>

        <div className="member-list-card-actions">
          <Link href={bookDetailPath(reservation.bookId)} className="member-inline-link">
            View details →
          </Link>
          {canCancel ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={cancelPending}
              onClick={() => onCancel?.(reservation)}
            >
              {cancelPending ? 'Cancelling…' : 'Cancel reservation'}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
