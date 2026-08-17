import Link from 'next/link';
import type { Book } from '@shared/types';
import { bookDetailPath } from '@/lib/auth/routes';
import { BookCover } from './book-cover';
import { StatusChip } from './status-chip';

export function BookCard({ book }: Readonly<{ book: Book }>) {
  const available = book.availableCopies ?? null;
  const total = book.totalCopies ?? null;
  const inStock = available != null && available > 0;

  return (
    <Link
      href={bookDetailPath(book.id)}
      className="member-card member-book-card member-card-link p-4"
    >
      <div className="member-book-card-top">
        <BookCover title={book.title} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="m-0 line-clamp-2 text-sm font-semibold tracking-tight text-[color:var(--bookly-navy)]">
            {book.title}
          </h3>
          <p className="m-0 mt-1 line-clamp-1 text-sm text-[color:var(--bookly-muted)]">
            {book.author}
          </p>
          <p className="m-0 mt-1 font-mono text-xs text-[color:var(--bookly-muted)]">
            ISBN {book.isbn}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        {available != null && total != null ? (
          <StatusChip tone={inStock ? 'available' : 'neutral'}>
            {inStock ? `${available} available` : 'Unavailable'}
          </StatusChip>
        ) : (
          <span />
        )}
        <span className="text-sm font-semibold text-[color:var(--bookly-navy)]">
          View details →
        </span>
      </div>
    </Link>
  );
}
