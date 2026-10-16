import { formatMoneyInr, formatShortDate } from '@/lib/member';
import { StatusChip } from './status-chip';

type FineLike = {
  id: string;
  daysOverdue: number;
  amountCents: number;
  status: 'unpaid' | 'paid' | 'waived';
  createdAt: string;
  loan: {
    returnedAt?: string | null;
    book: { title: string; author?: string };
  };
};

function fineTone(status: FineLike['status']): 'unpaid' | 'paid' | 'waived' {
  if (status === 'unpaid') return 'unpaid';
  if (status === 'paid') return 'paid';
  return 'waived';
}

function fineLabel(status: FineLike['status']): string {
  if (status === 'unpaid') return 'Outstanding';
  if (status === 'paid') return 'Paid';
  return 'Waived';
}

export function FineRow({ fine }: Readonly<{ fine: FineLike }>) {
  const stillBorrowed = fine.status === 'unpaid' && !fine.loan.returnedAt;
  const whenLabel = stillBorrowed ? 'Still borrowed' : formatShortDate(fine.createdAt);

  return (
    <article className="member-card member-fine-card">
      <div className="min-w-0">
        <h3 className="m-0 truncate text-sm font-semibold text-[color:var(--bookly-navy)]">
          {fine.loan.book.title}
        </h3>
        {fine.loan.book.author ? (
          <p className="m-0 text-sm text-[color:var(--bookly-muted)]">{fine.loan.book.author}</p>
        ) : null}
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
          {fine.daysOverdue} day{fine.daysOverdue === 1 ? '' : 's'} overdue · {whenLabel}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatusChip tone={fineTone(fine.status)}>{fineLabel(fine.status)}</StatusChip>
        <p className="m-0 font-mono text-sm font-semibold text-[color:var(--bookly-navy)]">
          {formatMoneyInr(fine.amountCents)}
        </p>
      </div>
    </article>
  );
}
