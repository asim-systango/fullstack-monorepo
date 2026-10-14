'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Minus, Plus, ShoppingCart } from 'lucide-react';
import { RequireRole, useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout';
import { PriceBreakdown } from '@/components/food';
import {
  useCart,
  usePlaceOrder,
  useUpdateCartItem,
} from '@/lib/hooks/food-delivery';
import { useFormErrors } from '@/lib/hooks/use-form-errors';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { calculatePricing, formatInr } from '@/lib/pricing';
import { toastApiError, toastSuccess } from '@/lib/toast';
import { parsePlaceOrder } from '@/lib/validation/food-delivery';

const COLOR_TEXT = 'var(--tg-text)';
const COLOR_TEXT_MUTED = 'var(--tg-text-muted)';

function CartContent() {
  const router = useRouter();
  const { user, refresh, saveAddress } = useAuth();
  const { data: cart, isLoading, isError, error } = useCart({ enabled: true });
  const updateItem = useUpdateCartItem();
  const placeOrder = usePlaceOrder();

  const savedAddress = user?.deliveryAddress?.trim() ?? '';
  const [useSavedAddress, setUseSavedAddress] = useState(Boolean(savedAddress));
  const [newAddress, setNewAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const { errors, applyParse } = useFormErrors();

  useToastQueryError(isError, error);

  useEffect(() => {
    if (savedAddress) {
      setUseSavedAddress(true);
    }
  }, [savedAddress]);

  const deliveryAddress = useSavedAddress && savedAddress ? savedAddress : newAddress;

  function syncAddressValidation(nextAddress: string, forceShow = false) {
    return applyParse(parsePlaceOrder({ deliveryAddress: nextAddress }), forceShow);
  }

  async function changeQty(cartItemId: string, quantity: number) {
    try {
      await updateItem.mutateAsync({ cartItemId, quantity });
    } catch (err) {
      toastApiError(err);
    }
  }

  if (isLoading) {
    return null;
  }

  if (isError) {
    return (
      <p style={{ color: COLOR_TEXT_MUTED, textAlign: 'center', padding: '40px 0' }}>
        Could not load your cart. Please try again.
      </p>
    );
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
        <p style={{ fontSize: 16, fontWeight: 500, color: COLOR_TEXT, margin: '0 0 6px' }}>
          Your cart is empty
        </p>
        <p style={{ fontSize: 13, color: COLOR_TEXT_MUTED, margin: '0 0 18px' }}>
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

  function getValidAddress(): string | null {
    const parsed = parsePlaceOrder({ deliveryAddress });
    if (!applyParse(parsed, true)) return null;
    if (!parsed.success) return null;
    return parsed.data.deliveryAddress;
  }

  async function handlePlaceOrder() {
    const address = getValidAddress();
    if (!address) return;

    setPlacing(true);

    try {
      const order = await placeOrder.mutateAsync({ deliveryAddress: address });
      await saveAddress({ deliveryAddress: address });
      await refresh();
      toastSuccess('Order placed');
      router.push(`/orders/${order.id}`);
    } catch (err) {
      toastApiError(err);
    } finally {
      setPlacing(false);
    }
  }

  const addressError = errors.deliveryAddress;

  return (
    <div className="tg-cart-grid">
      <div>
        <h1 style={{ fontSize: 19, fontWeight: 500, margin: '0 0 4px', color: COLOR_TEXT }}>
          Your cart
        </h1>
        <p style={{ fontSize: 13, color: COLOR_TEXT_MUTED, margin: '0 0 16px' }}>
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
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: COLOR_TEXT }}>
                  {line.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: COLOR_TEXT_MUTED }}>
                  {formatInr(line.price)} each
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="tg-qty-btn"
                    disabled={placing}
                    onClick={() => void changeQty(line.id, line.quantity - 1)}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: 13, minWidth: 14, textAlign: 'center' }}>
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    className="tg-qty-btn"
                    disabled={placing}
                    onClick={() => void changeQty(line.id, line.quantity + 1)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: COLOR_TEXT,
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

        <p className="tg-section-label">Delivery address *</p>

        {savedAddress ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <label
              className="tg-card"
              style={{
                display: 'flex',
                gap: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                border: useSavedAddress ? '1px solid var(--tg-brand-accent)' : '1px solid var(--tg-border)',
              }}
            >
              <input
                type="radio"
                name="addressChoice"
                checked={useSavedAddress}
                onChange={() => {
                  setUseSavedAddress(true);
                  syncAddressValidation(savedAddress);
                }}
                style={{ marginTop: 3 }}
              />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLOR_TEXT }}>
                  Saved address
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: COLOR_TEXT_MUTED }}>
                  <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {savedAddress}
                </p>
              </div>
            </label>

            <label
              className="tg-card"
              style={{
                display: 'flex',
                gap: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                border: !useSavedAddress ? '1px solid var(--tg-brand-accent)' : '1px solid var(--tg-border)',
              }}
            >
              <input
                type="radio"
                name="addressChoice"
                checked={!useSavedAddress}
                onChange={() => {
                  setUseSavedAddress(false);
                  syncAddressValidation(newAddress);
                }}
                style={{ marginTop: 3 }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLOR_TEXT }}>
                  Deliver to a different address
                </p>
                {!useSavedAddress ? (
                  <>
                    <textarea
                      className={`tg-textarea${addressError ? ' tg-input-invalid' : ''}`}
                      value={newAddress}
                      onChange={(e) => {
                        const next = e.target.value;
                        setNewAddress(next);
                        syncAddressValidation(next);
                      }}
                      placeholder="House no, street, city"
                      style={{ marginTop: 10, minHeight: 72 }}
                      aria-invalid={Boolean(addressError)}
                      aria-describedby={addressError ? 'cart-address-error' : undefined}
                    />
                    {addressError ? (
                      <p id="cart-address-error" className="tg-field-error">
                        {addressError}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>
            </label>
          </div>
        ) : (
          <>
            <textarea
              className={`tg-textarea${addressError ? ' tg-input-invalid' : ''}`}
              value={newAddress}
              onChange={(e) => {
                const next = e.target.value;
                setNewAddress(next);
                syncAddressValidation(next);
              }}
              placeholder="House no, street, city (required)"
              style={{ minHeight: 72 }}
              aria-invalid={Boolean(addressError)}
              aria-describedby={addressError ? 'cart-address-error' : undefined}
            />
            {addressError ? (
              <p id="cart-address-error" className="tg-field-error">
                {addressError}
              </p>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--tg-text-faint)', marginTop: 6 }}>
                This address will be saved for your next order.
              </p>
            )}
          </>
        )}
      </div>

      <div className="tg-card" style={{ padding: '18px 20px', position: 'sticky', top: 76 }}>
        <p className="tg-section-label">Price details</p>
        <PriceBreakdown pricing={pricing} />
        <button
          type="button"
          className="tg-btn tg-btn-primary"
          disabled={placing}
          style={{ width: '100%', height: 46, borderRadius: 11, marginTop: 16 }}
          onClick={() => void handlePlaceOrder()}
        >
          {placing ? 'Placing order…' : `Place order · ${formatInr(pricing.total)}`}
        </button>
        <p
          style={{
            fontSize: 11.5,
            color: 'var(--tg-text-faint)',
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          Kitchen receives this immediately. Payment is optional on the order page.
        </p>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <RequireRole roles={['user', 'staff', 'admin']}>
      <AppShell>
        <CartContent />
      </AppShell>
    </RequireRole>
  );
}
