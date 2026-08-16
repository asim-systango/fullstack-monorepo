'use client';

import { OVERDUE_RETURN_SETTLEMENT_MESSAGE, type LoanWithRelations } from '@shared/types';
import { formatMoneyInr } from '@/lib/member/format';

export type FineSettlement = 'paid' | 'unpaid';

export function needsReturnFineSettlement(
  loan: LoanWithRelations,
  daysLate: number,
): boolean {
  if (loan.fine?.status === 'paid' || loan.fine?.status === 'waived') return false;
  return daysLate > 0 || loan.fine?.status === 'unpaid';
}

export function StaffFineSettlement({
  daysLate,
  amountCents,
  value,
  onChange,
  disabled,
}: Readonly<{
  daysLate: number;
  amountCents: number | null;
  value: FineSettlement | null;
  onChange: (value: FineSettlement) => void;
  disabled?: boolean;
}>) {
  const amountLabel =
    amountCents != null && amountCents > 0 ? formatMoneyInr(amountCents) : null;

  return (
    <div className="staff-settlement">
      <p className="m-0 text-sm font-medium text-[color:var(--bookly-navy)]">Fine settlement</p>
      <p className="staff-section-desc">
        {amountLabel
          ? `Overdue ${daysLate} day(s) · ${amountLabel}. Collect the fine at the desk, then mark Paid. If the member cannot pay now, mark Unpaid so the balance stays on their account.`
          : OVERDUE_RETURN_SETTLEMENT_MESSAGE}
      </p>
      <div className="staff-choice-grid" role="radiogroup" aria-label="Fine settlement">
        <button
          type="button"
          role="radio"
          aria-checked={value === 'paid'}
          className={`staff-pick-row ${value === 'paid' ? 'is-selected' : ''}`}
          disabled={disabled}
          onClick={() => onChange('paid')}
        >
          <div className="min-w-0 flex-1">
            <p className="m-0 font-medium">Paid</p>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              Fine collected at the desk
            </p>
          </div>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === 'unpaid'}
          className={`staff-pick-row ${value === 'unpaid' ? 'is-selected' : ''}`}
          disabled={disabled}
          onClick={() => onChange('unpaid')}
        >
          <div className="min-w-0 flex-1">
            <p className="m-0 font-medium">Unpaid</p>
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              Keep the balance on the member account
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
