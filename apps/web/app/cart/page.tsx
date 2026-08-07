'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { ApiClientError } from '@shared/api-client';
import { RequireRole } from '@/components/auth';
import { AppShell } from '@/components/layout';
import { MockPaymentDialog, PriceBreakdown } from '@/components/food';
import { useCart, usePlaceOrder, useUpdateCartItem } from '@/lib/hooks/food-delivery';
import { calculatePricing, formatInr } from '@/lib/pricing';
import { parsePlaceOrder } from '@/lib/validation/food-delivery';

function CartContent() {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const placeOrder = usePlaceOrder();

  const [address, setAddress] = useState('21 MG Road, Apt 4B, Indore');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  if (isLoading) {
    return <p style={{ color: 'var(--tg-text-muted)' }}>Loading cart…</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--tg-surface-alt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <ShoppingCart size={22} color="var(--tg-text-faint)" />
        </div>
        <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--tg-text)', margin: '0 0 6px' }}>
          Your cart is empty
        </p>
        <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '0 0 18px' }}>
          Add items from a restaurant to see them here.
        </p>
        <Link href="/restaurants" className="tg-btn tg-btn-primary" style={{ textDecoration: 'none' }}>
          Browse restaurants
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const pricing = calculatePricing(subtotal);

  function openPayment() {
    setFormError(null);
    const parsed = parsePlaceOrder({ deliveryAddress: address });
    if (!parsed.success) {
      setFieldError(parsed.errors.deliveryAddress ?? 'Invalid address');
      return;
    }
    setFieldError(null);
    setPayOpen(true);
  }

  async function confirmPayment() {
    const parsed = parsePlaceOrder({ deliveryAddress: address });
    if (!parsed.success) {
      setPayOpen(false);
      return;
    }
    try {
      const order = await placeOrder.mutateAsync({ deliveryAddress: parsed.data.deliveryAddress });
      setPayOpen(false);
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Could not place order');
      setPayOpen(false);
    }
  }

  return (
    <div className="tg-cart-grid">
      <div>
        <h1 style={{ fontSize: 19, fontWeight: 500, margin: '0 0 4px', color: 'var(--tg-text)' }}>
          Your cart
        </h1>
        <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '0 0 16px' }}>
          {cart.restaurantName}
        </p>

        <div className="tg-card" style={{ padding: '6px 18px', marginBottom: 16 }}>
          {cart.items.map((line) => (
            <div
              key={line.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--tg-border)',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--tg-text)' }}>
                  {line.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--tg-text-muted)' }}>
                  {formatInr(line.price)} each
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="tg-qty-btn"
                    onClick={() =>
                      void updateItem.mutateAsync({
                        cartItemId: line.id,
                        quantity: line.quantity - 1,
                      })
                    }
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: 13, minWidth: 14, textAlign: 'center' }}>
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    className="tg-qty-btn"
                    onClick={() =>
                      void updateItem.mutateAsync({
                        cartItemId: line.id,
                        quantity: line.quantity + 1,
                      })
                    }
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--tg-text)',
                    minWidth: 64,
                    textAlign: 'right',
                  }}
                >
                  {formatInr(line.price * line.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="tg-section-label">Delivery address</p>
        <input className="tg-input" value={address} onChange={(e) => setAddress(e.target.value)} />
        {fieldError ? (
          <p style={{ fontSize: 12.5, color: 'var(--tg-danger-fg)', marginTop: 8 }}>{fieldError}</p>
        ) : null}
      </div>

      <div className="tg-card" style={{ padding: '18px 20px', position: 'sticky', top: 76 }}>
        <p className="tg-section-label">Price details</p>
        <PriceBreakdown pricing={pricing} />
        {formError ? (
          <p style={{ fontSize: 12.5, color: 'var(--tg-danger-fg)', marginTop: 10 }}>{formError}</p>
        ) : null}
        <button
          type="button"
          className="tg-btn tg-btn-primary"
          disabled={placeOrder.isPending}
          style={{ width: '100%', height: 46, borderRadius: 11, marginTop: 16 }}
          onClick={openPayment}
        >
          Pay {formatInr(pricing.total)} and place order
        </button>
        <p
          style={{
            fontSize: 11.5,
            color: 'var(--tg-text-faint)',
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          Demo payment · card ending 4242
        </p>
      </div>

      <MockPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        total={pricing.total}
        pending={placeOrder.isPending}
        onConfirm={() => void confirmPayment()}
      />
    </div>
  );
}

export default function CartPage() {
  return (
    <AppShell>
      <RequireRole roles={['user', 'staff', 'admin']}>
        <CartContent />
      </RequireRole>
    </AppShell>
  );
}
