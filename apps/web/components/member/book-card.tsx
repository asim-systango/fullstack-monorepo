import Link from 'next/link';
import type { Book } from '@shared/types';
import { bookDetailPath } from '@/lib/auth/routes';
import { BookCover } from './book-cover';

export function BookCard({ book }: Readonly<{ book: Book }>) {
  return (
    <Link
      href={bookDetailPath(book.id)}
      className="member-card member-book-card member-card-link p-3"
    >
      <BookCover title={book.title} />
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className="m-0 line-clamp-2 text-sm font-semibold tracking-tight text-[color:var(--bookly-navy)]">
          {book.title}
        </h3>
        <p className="m-0 line-clamp-1 text-sm text-[color:var(--bookly-muted)]">
          {book.author}
        </p>
        <p className="m-0 mt-auto pt-2 font-mono text-xs text-[color:var(--bookly-muted)]">
          ISBN {book.isbn}
        </p>
      </div>
    </Link>
  );
}
