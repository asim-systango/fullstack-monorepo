import { Check } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '@/lib/order-status';
import type { DeliveryStatusEntry, OrderStatus } from '@/lib/types/food-delivery';

const FLOW: OrderStatus[] = ['placed', 'preparing', 'out_for_delivery', 'delivered'];

type OrderTimelineProps = Readonly<{
  currentStatus: OrderStatus;
  history?: readonly DeliveryStatusEntry[];
}>;

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === 'cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'var(--tg-status-cancelled-fg)',
            flexShrink: 0,
          }}
        />
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: 'var(--tg-text)' }}>
          Order cancelled
        </p>
      </div>
    );
  }

  const currentIdx = FLOW.indexOf(currentStatus);

  return (
    <div>
      {FLOW.map((s, i) => (
        <div
          key={s}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            paddingBottom: i < FLOW.length - 1 ? 22 : 0,
            position: 'relative',
          }}
        >
          {i < FLOW.length - 1 ? (
            <div
              style={{
                position: 'absolute',
                left: 7,
                top: 16,
                bottom: 0,
                width: 2,
                background: i < currentIdx ? 'var(--tg-status-delivered-fg)' : 'var(--tg-border)',
              }}
            />
          ) : null}
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              marginTop: 2,
              flexShrink: 0,
              background: i <= currentIdx ? 'var(--tg-status-delivered-fg)' : 'var(--tg-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {i <= currentIdx ? <Check size={10} color="#FFFFFF" /> : null}
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                fontWeight: 500,
                color: i <= currentIdx ? 'var(--tg-text)' : 'var(--tg-text-faint)',
              }}
            >
              {ORDER_STATUS_LABELS[s]}
            </p>
            {i === currentIdx && i < FLOW.length - 1 ? (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--tg-text-muted)' }}>
                We&apos;ll update this as your order moves along.
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
