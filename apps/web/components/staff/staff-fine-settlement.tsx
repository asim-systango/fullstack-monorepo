'use client';

import { useId } from 'react';
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
  const name = useId();
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
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="sr-only">Fine settlement</legend>
        <div className="staff-choice-grid">
          <label className={`staff-pick-row ${value === 'paid' ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value="paid"
              checked={value === 'paid'}
              disabled={disabled}
              onChange={() => onChange('paid')}
            />
            <span className="min-w-0 flex-1">
              <span className="m-0 block font-medium">Paid</span>
              <span className="m-0 block text-sm text-[color:var(--bookly-muted)]">
                Fine collected at the desk
              </span>
            </span>
          </label>
          <label className={`staff-pick-row ${value === 'unpaid' ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value="unpaid"
              checked={value === 'unpaid'}
              disabled={disabled}
              onChange={() => onChange('unpaid')}
            />
            <span className="min-w-0 flex-1">
              <span className="m-0 block font-medium">Unpaid</span>
              <span className="m-0 block text-sm text-[color:var(--bookly-muted)]">
                Keep the balance on the member account
              </span>
            </span>
          </label>
        </div>
      </fieldset>
    </div>
  );
}
