import type { Book } from '@shared/types';
import { BookCover } from '@/components/member';

export function StaffBookCard({ book }: Readonly<{ book: Book }>) {
  return (
    <li className="staff-book-row rounded-lg border border-[color:var(--bookly-border)] bg-[color:var(--bookly-paper-warm,#f7f6f2)] p-3">
      <BookCover title={book.title} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-medium text-[color:var(--bookly-navy)]">
          {book.title}
        </p>
        <p className="m-0 truncate text-sm text-[color:var(--bookly-muted)]">
          {book.author}
        </p>
        <p className="m-0 mt-1 font-mono text-xs text-[color:var(--bookly-muted)]">
          {book.isbn}
          {book.publishedYear ? ` · ${book.publishedYear}` : ''}
        </p>
      </div>
    </li>
  );
}
