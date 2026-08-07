'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { RequireRole, useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout';
import { OrderStatusBadge } from '@/components/food';
import { useOrders } from '@/lib/hooks/food-delivery';
import { formatInr } from '@/lib/pricing';
import type { Order } from '@/lib/types/food-delivery';

const FILTERS = ['All', 'Active', 'Delivered', 'Cancelled'] as const;

function matchesFilter(order: Order, filter: (typeof FILTERS)[number]): boolean {
  if (filter === 'All') return true;
  if (filter === 'Active') {
    return ['placed', 'preparing', 'out_for_delivery'].includes(order.status);
  }
  if (filter === 'Delivered') return order.status === 'delivered';
  return order.status === 'cancelled';
}

type OrdersRole = 'user' | 'staff' | 'admin';

function resolveOrdersRole(role: string | undefined): OrdersRole {
  if (role === 'admin') return 'admin';
  if (role === 'staff') return 'staff';
  return 'user';
}

function OrdersList({
  title,
  subtitle,
  role,
}: Readonly<{
  title: string;
  subtitle?: string;
  role: OrdersRole;
}>) {
  const { data, isLoading, isError, error } = useOrders(role);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const filtered = useMemo(
    () => (data?.items ?? []).filter((o) => matchesFilter(o, filter)),
    [data, filter],
  );

  return (
    <>
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
            {title}
          </h1>
          {subtitle ? (
            <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '4px 0 0' }}>
              {subtitle}
            </p>
          ) : null}
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

      {isLoading ? <p style={{ color: 'var(--tg-text-muted)' }}>Loading orders…</p> : null}
      {isError ? (
        <p style={{ color: 'var(--tg-danger-fg)' }}>
          {error instanceof Error ? error.message : 'Could not load orders'}
        </p>
      ) : null}

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
        {!isLoading && filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--tg-text-faint)', padding: '24px 0', textAlign: 'center' }}>
            No orders in this filter.
          </p>
        ) : null}
      </div>
    </>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const role = resolveOrdersRole(user?.role);

  return (
    <AppShell>
      <RequireRole roles={['user', 'staff', 'admin']}>
        <OrdersList title="Your orders" role={role} />
      </RequireRole>
    </AppShell>
  );
}
