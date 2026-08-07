import type { OrderStatus } from '@/lib/types/food-delivery';
import { ORDER_STATUS_LABELS } from '@/lib/order-status';

export function OrderStatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
  return (
    <span
      style={{
        background: `var(--tg-status-${status}-bg)`,
        color: `var(--tg-status-${status}-fg)`,
        fontSize: 12,
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

/** @deprecated Prefer OrderStatusBadge */
export const StatusBadge = OrderStatusBadge;
