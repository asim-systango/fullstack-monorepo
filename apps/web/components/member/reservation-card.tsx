import type { Book } from '@shared/types';
import { Button } from '@shared/ui/components';
import { formatShortDate } from '@/lib/member';
import { BookCover } from './book-cover';
import { StatusChip } from './status-chip';

type ReservationLike = {
  id: string;
  bookId: string;
  status: string;
  queuePosition: number | null;
  createdAt: string;
  book: Pick<Book, 'title' | 'author'>;
};

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
    <article className="member-card flex items-start gap-3 p-4">
      <BookCover title={reservation.book.title} size="sm" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="m-0 truncate text-sm font-semibold text-[color:var(--bookly-navy)]">
              {reservation.book.title}
            </h3>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              {reservation.book.author}
            </p>
          </div>
          <StatusChip tone="neutral">{reservation.status}</StatusChip>
        </div>

        {position != null ? (
          <div className="mt-3">
            <p className="member-queue m-0 text-lg">#{position} in queue</p>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">{queueHint}</p>
          </div>
        ) : null}

        <p className="mt-2 mb-0 text-sm text-[color:var(--bookly-muted)]">
          Reserved {formatShortDate(reservation.createdAt)}
        </p>

        {canCancel ? (
          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={cancelPending}
              onClick={() => onCancel?.(reservation)}
            >
              {cancelPending ? 'Cancelling…' : 'Cancel reservation'}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
