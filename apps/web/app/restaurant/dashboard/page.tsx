'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { OrderStatusBadge } from '@/components/food';
import {
  useMyRestaurant,
  useOrders,
  useUpdateOrderStatus,
} from '@/lib/hooks/food-delivery';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { getNextStatuses, NEXT_STATUS_LABELS } from '@/lib/order-status';
import { formatInr } from '@/lib/pricing';
import { toastApiError, toastSuccess } from '@/lib/toast';
import type { OrderStatus } from '@/lib/types/food-delivery';

export default function RestaurantDashboardPage() {
  const myRestaurant = useMyRestaurant();
  const { data, isLoading, isError, error } = useOrders('restaurant');
  const updateStatus = useUpdateOrderStatus();

  useToastQueryError(myRestaurant.isError, myRestaurant.error);
  useToastQueryError(isError, error);

  const restaurantName = myRestaurant.data?.name ?? 'Your restaurant';

  const active = (data?.items ?? []).filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled',
  );

  async function advance(orderId: string, status: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toastSuccess('Order status updated');
    } catch (err) {
      toastApiError(err);
    }
  }

  return (
    <AppShell>
      <h1 style={{ fontSize: 19, fontWeight: 500, margin: '0 0 4px', color: 'var(--tg-text)' }}>
        Incoming orders
      </h1>
      <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '0 0 18px' }}>
        {restaurantName} · live queue, scoped to your restaurant
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {active.map((o) => {
          const next = getNextStatuses(o.status).filter((s) => s !== 'cancelled');
          const cancel = getNextStatuses(o.status).includes('cancelled');
          return (
            <div
              key={o.id}
              className="tg-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: 'var(--tg-text)' }}>
                  {o.id.slice(0, 8)}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--tg-text-muted)' }}>
                  {o.lines.map((l) => `${l.itemName} ×${l.quantity}`).join(', ')} ·{' '}
                  {formatInr(o.total)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <OrderStatusBadge status={o.status} />
                {next.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="tg-btn tg-btn-primary tg-btn-sm"
                    disabled={updateStatus.isPending}
                    onClick={() => void advance(o.id, s)}
                  >
                    {NEXT_STATUS_LABELS[s] ?? s}
                  </button>
                ))}
                {cancel ? (
                  <button
                    type="button"
                    className="tg-btn tg-btn-secondary tg-btn-sm"
                    style={{ color: 'var(--tg-danger-fg)' }}
                    disabled={updateStatus.isPending}
                    onClick={() => void advance(o.id, 'cancelled')}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {!isLoading && active.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--tg-text-faint)', padding: '24px 0', textAlign: 'center' }}>
            No active orders right now.
          </p>
        ) : null}
      </div>

      <p style={{ marginTop: 16, fontSize: 13 }}>
        <Link href="/restaurant/menu" style={{ color: 'var(--tg-brand-accent)' }}>
          Manage menu →
        </Link>
      </p>
    </AppShell>
  );
}
