'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RequireRole } from '@/components/auth';
import { AppShell } from '@/components/layout';
import { OrderStatusBadge, OrderTimeline, PriceBreakdown } from '@/components/food';
import { useOrder } from '@/lib/hooks/food-delivery';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { formatInr } from '@/lib/pricing';

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

function OrderDetail({ id }: Readonly<{ id: string }>) {
  const { data: order, isLoading, isError, error } = useOrder(id);

  useToastQueryError(isError, error);

  if (isLoading) return null;
  if (isError || !order) {
    return (
      <Link
        href="/orders"
        className="tg-btn tg-btn-ghost"
        style={{ textDecoration: 'none' }}
      >
        <ArrowLeft size={14} /> Back to orders
      </Link>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
      }}
    >
      <div>
        <Link
          href="/orders"
          className="tg-btn tg-btn-ghost"
          style={{ textDecoration: 'none', marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>
        <h1 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px', color: 'var(--tg-text)' }}>
          Order {order.id.slice(0, 8)}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '0 0 18px' }}>
          {order.restaurantName} · {new Date(order.createdAt).toLocaleString()}
        </p>

        <div className="tg-card" style={{ padding: '18px 20px' }}>
          <p className="tg-section-label">Delivery timeline</p>
          <OrderTimeline currentStatus={order.status} history={order.deliveryStatuses} />
        </div>
      </div>

      <div className="tg-card" style={{ padding: '18px 20px', height: 'fit-content' }}>
        <p className="tg-section-label">Receipt</p>
        {order.lines.map((l) => (
          <div
            key={l.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '5px 0',
              fontSize: 13,
              color: 'var(--tg-text-muted)',
            }}
          >
            <span>
              {l.itemName} × {l.quantity}
            </span>
            <span>{formatInr(l.unitPrice * l.quantity)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--tg-border)', margin: '8px 0' }} />
        <PriceBreakdown pricing={order} totalLabel="Total paid" />
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <OrderStatusBadge status={order.status} />
          <span style={{ fontSize: 12, color: 'var(--tg-text-faint)' }}>
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <RequireRole roles={['user', 'staff', 'admin']}>
      <AppShell>
        <OrderDetail id={id} />
      </AppShell>
    </RequireRole>
  );
}
