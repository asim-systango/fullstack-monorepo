'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RequireRole, useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout';
import { MockPaymentDialog, OrderStatusBadge, OrderTimeline, PriceBreakdown } from '@/components/food';
import { RefreshButton } from '@/components/ui/refresh-button';
import {
  useCreatePaymentCheckout,
  useOrder,
  useVerifyPayment,
} from '@/lib/hooks/food-delivery';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { isMockFoodApiEnabled } from '@/lib/food-api';
import { formatInr } from '@/lib/pricing';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { toastApiError, toastSuccess } from '@/lib/toast';
import type { Order } from '@/lib/types/food-delivery';

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

function OrderPaymentStretch({ order }: Readonly<{ order: Order }>) {
  const { user } = useAuth();
  const createPayment = useCreatePaymentCheckout();
  const verifyPayment = useVerifyPayment();
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const canPay =
    order.paymentStatus === 'pending' &&
    Boolean(user?.id) &&
    (user?.id === order.userId || user?.role === 'admin');

  if (!canPay) return null;

  async function handlePay() {
    setPaying(true);
    try {
      const checkout = await createPayment.mutateAsync(order.id);
      if (isMockFoodApiEnabled() || checkout.mock) {
        setPayOpen(true);
        return;
      }
      if (!checkout.razorpayOrderId) {
        throw new Error('Missing Razorpay order id');
      }
      const response = await openRazorpayCheckout({
        keyId: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        razorpayOrderId: checkout.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
      });
      await verifyPayment.mutateAsync({
        orderId: order.id,
        input: {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        },
      });
      toastSuccess('Payment successful');
    } catch (err) {
      toastApiError(err);
    } finally {
      setPaying(false);
    }
  }

  async function confirmMockPayment() {
    setPaying(true);
    try {
      const checkout = await createPayment.mutateAsync(order.id);
      await verifyPayment.mutateAsync({
        orderId: order.id,
        input: {
          razorpayOrderId: checkout.razorpayOrderId ?? `order_mock_${order.id}`,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature',
        },
      });
      setPayOpen(false);
      toastSuccess('Payment successful');
    } catch (err) {
      toastApiError(err);
      setPayOpen(false);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div style={{ marginTop: 14 }}>
      <button
        type="button"
        className="tg-btn tg-btn-secondary"
        disabled={paying}
        style={{ width: '100%' }}
        onClick={() => void handlePay()}
      >
        {paying ? 'Starting checkout…' : 'Pay now (optional · Stretch)'}
      </button>
      <p style={{ fontSize: 11.5, color: 'var(--tg-text-faint)', margin: '8px 0 0' }}>
        Razorpay sandbox is Stretch. The kitchen can fulfill this order without payment.
      </p>
      <MockPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        total={order.total}
        pending={paying}
        onConfirm={() => void confirmMockPayment()}
      />
    </div>
  );
}

function OrderDetail({ id }: Readonly<{ id: string }>) {
  const { data: order, isLoading, isError, error, refetch, isRefetching } = useOrder(id);

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px', color: 'var(--tg-text)' }}>
              Order {order.id.slice(0, 8)}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: 0 }}>
              {order.restaurantName} · {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <RefreshButton onRefresh={() => refetch()} loading={isRefetching} />
        </div>

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
        <PriceBreakdown
          pricing={order}
          totalLabel={order.paymentStatus === 'paid' ? 'Total paid' : 'Total'}
        />
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <OrderStatusBadge status={order.status} />
          <span style={{ fontSize: 12, color: 'var(--tg-text-faint)' }}>
            Payment: {order.paymentStatus}
          </span>
        </div>
        <OrderPaymentStretch order={order} />
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
