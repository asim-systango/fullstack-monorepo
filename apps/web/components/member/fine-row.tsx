import { formatMoneyInr, formatShortDate } from '@/lib/member';
import { StatusChip } from './status-chip';

type FineLike = {
  id: string;
  daysOverdue: number;
  amountCents: number;
  status: 'unpaid' | 'paid' | 'waived';
  createdAt: string;
  loan: {
    book: { title: string };
  };
};

export function FineRow({ fine }: Readonly<{ fine: FineLike }>) {
  const tone = fine.status === 'unpaid' ? 'unpaid' : 'neutral';

  return (
    <article className="member-card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <h3 className="m-0 truncate text-sm font-semibold text-[color:var(--bookly-navy)]">
          {fine.loan.book.title}
        </h3>
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
          {fine.daysOverdue} day{fine.daysOverdue === 1 ? '' : 's'} overdue ·{' '}
          {formatShortDate(fine.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatusChip tone={tone}>{fine.status}</StatusChip>
        <p className="m-0 font-mono text-sm font-semibold text-[color:var(--bookly-navy)]">
          {formatMoneyInr(fine.amountCents)}
        </p>
      </div>
    </article>
  );
}
