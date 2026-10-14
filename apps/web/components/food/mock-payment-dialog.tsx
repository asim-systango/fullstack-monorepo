'use client';

import { formatInr } from '@/lib/pricing';
import { ModalShell } from '@/components/ui/modal-shell';

type MockPaymentDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: () => void;
  pending?: boolean;
}>;

export function MockPaymentDialog({
  open,
  onOpenChange,
  total,
  onConfirm,
  pending,
}: MockPaymentDialogProps) {
  return (
    <ModalShell
      open={open}
      onClose={() => onOpenChange(false)}
      closeOnBackdrop={!pending}
      labelledBy="mock-payment-title"
    >
      <p
        id="mock-payment-title"
        style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--tg-text)' }}
      >
        Confirm payment (demo)
      </p>
      <p style={{ margin: '8px 0 12px', fontSize: 13.5, color: 'var(--tg-text-muted)' }}>
        Simulated payment — no real charge. Demo card ending in 4242.
      </p>
      <p style={{ fontSize: 14, color: 'var(--tg-text)', margin: '0 0 6px' }}>
        Amount: <strong>{formatInr(total)}</strong>
      </p>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--tg-text-faint)', margin: '0 0 18px' }}>
        **** **** **** 4242
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          type="button"
          className="tg-btn tg-btn-ghost"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="tg-btn tg-btn-primary"
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? 'Processing…' : 'Confirm & pay'}
        </button>
      </div>
    </ModalShell>
  );
}
