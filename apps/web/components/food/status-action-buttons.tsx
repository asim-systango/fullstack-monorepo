'use client';

import { getNextStatuses, NEXT_STATUS_LABELS } from '@/lib/order-status';
import type { OrderStatus } from '@/lib/types/food-delivery';

type StatusActionButtonsProps = Readonly<{
  status: OrderStatus;
  pending?: boolean;
  onAdvance: (status: OrderStatus) => void;
}>;

export function StatusActionButtons({ status, pending, onAdvance }: StatusActionButtonsProps) {
  const next = getNextStatuses(status);

  if (next.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--tg-text-faint)', margin: 0 }}>
        No further updates for this order.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {next.map((step) => (
        <button
          key={step}
          type="button"
          className={`tg-btn tg-btn-sm ${step === 'cancelled' ? 'tg-btn-secondary' : 'tg-btn-primary'}`}
          style={step === 'cancelled' ? { color: 'var(--tg-danger-fg)' } : undefined}
          disabled={pending}
          onClick={() => onAdvance(step)}
        >
          {NEXT_STATUS_LABELS[step] ?? step}
        </button>
      ))}
    </div>
  );
}
