'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiClientError } from '@shared/api-client';
import { AppShell } from '@/components/layout';
import { OrderStatusBadge } from '@/components/food';
import { useOrders, useUpdateOrderStatus } from '@/lib/hooks/food-delivery';
import { getNextStatuses, NEXT_STATUS_LABELS } from '@/lib/order-status';
import { formatInr } from '@/lib/pricing';
import type { OrderStatus } from '@/lib/types/food-delivery';

export default function RestaurantDashboardPage() {
  const { data, isLoading, isError, error } = useOrders('staff');
  const updateStatus = useUpdateOrderStatus();
  const [actionError, setActionError] = useState<string | null>(null);

  const active = (data?.items ?? []).filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled',
  );

  async function advance(orderId: string, status: OrderStatus) {
    setActionError(null);
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : 'Could not update status');
    }
  }

  return (
    <AppShell>
      <h1 style={{ fontSize: 19, fontWeight: 500, margin: '0 0 4px', color: 'var(--tg-text)' }}>
        Incoming orders
      </h1>
      <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '0 0 18px' }}>
        Hasty Tasty · live queue, scoped to your restaurant
      </p>

      {actionError ? (
        <p style={{ color: 'var(--tg-danger-fg)', fontSize: 13, marginBottom: 12 }}>{actionError}</p>
      ) : null}

      {isLoading ? <p style={{ color: 'var(--tg-text-muted)' }}>Loading orders…</p> : null}
      {isError ? (
        <p style={{ color: 'var(--tg-danger-fg)' }}>
          {error instanceof Error ? error.message : 'Could not load orders'}
        </p>
      ) : null}

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
