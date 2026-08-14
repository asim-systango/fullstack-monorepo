import type { LoanWithRelations } from '@shared/types';
import { BookCover } from '@/components/member';
import { formatDueDate } from '@/lib/member/format';

export function StaffLoanRow({
  loan,
  overdueDays,
  fineLabel,
}: Readonly<{
  loan: LoanWithRelations;
  overdueDays?: number;
  fineLabel?: string | null;
}>) {
  const isOverdue = typeof overdueDays === 'number' && overdueDays > 0;

  return (
    <li className="staff-loan-row">
      <BookCover title={loan.book.title} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-medium text-[color:var(--bookly-navy)]">
          {loan.book.title}
        </p>
        <p className="m-0 truncate text-sm text-[color:var(--bookly-muted)]">
          {loan.book.author} · {loan.bookCopy.barcode}
        </p>
        <p className="m-0 mt-1 text-xs text-[color:var(--bookly-muted)]">
          Due {formatDueDate(loan.dueDate)}
          {fineLabel ? ` · ${fineLabel}` : ''}
        </p>
      </div>
      <span
        className={`staff-status-chip shrink-0 ${
          isOverdue ? 'staff-status-overdue' : 'staff-status-active'
        }`}
      >
        {isOverdue ? `Overdue · ${overdueDays}d` : 'Active'}
      </span>
    </li>
  );
}
