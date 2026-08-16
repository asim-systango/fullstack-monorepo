import type { LoanWithRelations } from '@shared/types';
import { daysLate, formatDueDate } from '@/lib/member';

export function LoanPicker({
  loans,
  selectedId,
  onSelect,
  loading,
}: Readonly<{
  loans: LoanWithRelations[];
  selectedId?: string | null;
  onSelect: (loan: LoanWithRelations) => void;
  loading?: boolean;
}>) {
  if (loading) {
    return <p className="m-0 text-sm text-[color:var(--bookly-muted)]">Loading loans…</p>;
  }

  return (
    <ul className="staff-result-list">
      {loans.map((loan) => (
        <li key={loan.id}>
          <button
            type="button"
            className={`staff-pick-row ${selectedId === loan.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(loan)}
          >
            <span className="font-medium">{loan.book.title}</span>
            {' · '}
            {loan.bookCopy.barcode}
            {' · Due '}
            {formatDueDate(loan.dueDate)}
            {daysLate(loan.dueDate) > 0 ? ' · Overdue' : ''}
          </button>
        </li>
      ))}
    </ul>
  );
}
