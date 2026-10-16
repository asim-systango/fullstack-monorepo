import { BookCover } from './book-cover';
import { StatusChip } from './status-chip';
import type { BookDetail } from '@shared/types';
import { getLoanDueStatus } from '@/lib/member';

export function BookHeader({
  book,
  available,
  ownLoanDueDate,
  reserved,
  requestPending,
}: Readonly<{
  book: BookDetail;
  available: boolean;
  ownLoanDueDate?: string | null;
  reserved?: boolean;
  requestPending?: boolean;
}>) {
  const loanStatus = ownLoanDueDate ? getLoanDueStatus(ownLoanDueDate) : null;

  return (
    <div className="member-book-identity">
      <div className="member-book-identity-heading">
        <BookCover title={book.title} size="lg" />
        <div className="min-w-0">
          <h1 className="member-page-title">{book.title}</h1>
          <p className="member-page-desc mt-2 mb-0 text-lg">{book.author}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {available ? (
          <StatusChip tone="available">Available</StatusChip>
        ) : (
          <StatusChip tone="neutral">Currently unavailable</StatusChip>
        )}
        {ownLoanDueDate ? (
          <StatusChip tone={loanStatus!.tone}>On loan to you</StatusChip>
        ) : null}
        {reserved ? <StatusChip tone="healthy">Reserved</StatusChip> : null}
        {requestPending ? <StatusChip tone="available">Request pending</StatusChip> : null}
      </div>
    </div>
  );
}
