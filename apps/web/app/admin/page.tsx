'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { OrderStatusBadge } from '@/components/food';
import { useOrders, useRestaurants } from '@/lib/hooks/food-delivery';
import { formatInr } from '@/lib/pricing';

export default function AdminOverviewPage() {
  const restaurants = useRestaurants();
  const orders = useOrders('admin');

  const list = orders.data?.items ?? [];
  const revenue = list
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);
  const restaurantCount = restaurants.data?.items.length ?? 0;

  const stats = [
    { label: 'Restaurants', value: String(restaurantCount) },
    { label: 'Orders', value: String(list.length) },
    { label: 'Revenue', value: formatInr(revenue) },
    {
      label: 'Avg order value',
      value: formatInr(revenue / Math.max(list.filter((o) => o.status !== 'cancelled').length, 1)),
    },
  ];

  return (
    <AppShell>
      <h1 style={{ fontSize: 19, fontWeight: 500, margin: '0 0 16px', color: 'var(--tg-text)' }}>
        Platform overview
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--tg-surface-alt)',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: 'var(--tg-text-muted)' }}>{s.label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 21, fontWeight: 500, color: 'var(--tg-text)' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <p className="tg-section-label">Recent orders</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="tg-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '13px 18px',
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
