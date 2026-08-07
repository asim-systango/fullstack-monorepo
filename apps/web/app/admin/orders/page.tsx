'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout';
import { OrderStatusBadge } from '@/components/food';
import { useOrders } from '@/lib/hooks/food-delivery';
import { formatInr } from '@/lib/pricing';
import type { Order } from '@/lib/types/food-delivery';

const FILTERS = ['All', 'Active', 'Delivered', 'Cancelled'] as const;

function matches(order: Order, filter: (typeof FILTERS)[number]) {
  if (filter === 'All') return true;
  if (filter === 'Active') {
    return ['placed', 'preparing', 'out_for_delivery'].includes(order.status);
  }
  if (filter === 'Delivered') return order.status === 'delivered';
  return order.status === 'cancelled';
}

export default function AdminOrdersPage() {
  const { data, isLoading } = useOrders('admin');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const filtered = useMemo(
    () => (data?.items ?? []).filter((o) => matches(o, filter)),
    [data, filter],
  );

  return (
    <AppShell>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 500, margin: 0, color: 'var(--tg-text)' }}>
            All orders
          </h1>
          <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '4px 0 0' }}>
            Platform-wide, across every restaurant
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              className={`tg-btn tg-btn-pill ${filter === s ? 'tg-btn-primary' : 'tg-btn-secondary'}`}
              style={{ padding: '6px 13px', fontSize: 12.5 }}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <p style={{ color: 'var(--tg-text-muted)' }}>Loading…</p> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="tg-card tg-card-hover"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              textDecoration: 'none',
              color: 'inherit',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: 'var(--tg-text)' }}>
                {o.restaurantName}{' '}
                <span style={{ color: 'var(--tg-text-faint)', fontWeight: 400 }}>
                  · {o.id.slice(0, 8)}
                </span>
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--tg-text-muted)' }}>
                {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 14, color: 'var(--tg-text)' }}>{formatInr(o.total)}</span>
              <OrderStatusBadge status={o.status} />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
