'use client';

import { use, useRef, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout';
import { CartSwitchDialog, DietBadge, FoodImage } from '@/components/food';
import {
  useAddToCart,
  useCart,
  useClearCart,
  useMenuItems,
  useRestaurant,
  useUpdateCartItem,
} from '@/lib/hooks/food-delivery';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { foodKeys } from '@/lib/query-keys';
import { formatInr } from '@/lib/pricing';
import { toastApiError } from '@/lib/toast';
import type { CartSummary } from '@/lib/types/food-delivery';

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default function RestaurantDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const restaurant = useRestaurant(id);
  const menu = useMenuItems(id, false);
  const cart = useCart({ enabled: true });
  const addToCart = useAddToCart();
  const updateCart = useUpdateCartItem();
  const clearCart = useClearCart();
  const qtyJobs = useRef<Record<string, Promise<void>>>({});

  const [switchOpen, setSwitchOpen] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [qtyOverride, setQtyOverride] = useState<Record<string, number>>({});

  useToastQueryError(restaurant.isError, restaurant.error);
  useToastQueryError(menu.isError, menu.error);

  const qtyByMenuId = new Map(
    (cart.data?.items ?? [])
      .filter((i) => i.restaurantId === id)
      .map((i) => [i.menuItemId, { qty: i.quantity, cartItemId: i.id }] as const),
  );

  function displayQty(menuItemId: string): number {
    if (menuItemId in qtyOverride) return qtyOverride[menuItemId] ?? 0;
    return qtyByMenuId.get(menuItemId)?.qty ?? 0;
  }

  const cartCount =
    (cart.data?.items.reduce((s, i) => s + i.quantity, 0) ?? 0) +
    Object.entries(qtyOverride).reduce((s, [menuItemId, qty]) => {
      const server = qtyByMenuId.get(menuItemId)?.qty ?? 0;
      return s + (qty - server);
    }, 0);

  async function setQty(menuItemId: string, nextQty: number) {
    const existing = qtyByMenuId.get(menuItemId);
    const otherRestaurant =
      cart.data?.restaurantId && cart.data.restaurantId !== id ? cart.data.restaurantId : null;

    if (otherRestaurant && nextQty > 0 && !existing) {
      setPendingItemId(menuItemId);
      setSwitchOpen(true);
      return;
    }

    const safeQty = Math.max(0, nextQty);
    setQtyOverride((prev) => ({ ...prev, [menuItemId]: safeQty }));

    const previous = qtyJobs.current[menuItemId] ?? Promise.resolve();
    const job = previous
      .catch(() => undefined)
      .then(async () => {
        const latest = queryClient.getQueryData<CartSummary>(foodKeys.cart(user?.id ?? 'guest'));
        const line = latest?.items.find((item) => item.menuItemId === menuItemId);
        if (line) {
          await updateCart.mutateAsync({ cartItemId: line.id, quantity: safeQty });
        } else if (safeQty > 0) {
          await addToCart.mutateAsync({ menuItemId, quantity: safeQty });
        }
        setQtyOverride((prev) => {
          const next = { ...prev };
          delete next[menuItemId];
          return next;
        });
      })
      .catch((err: unknown) => {
        setQtyOverride((prev) => {
          const next = { ...prev };
          delete next[menuItemId];
          return next;
        });
        toastApiError(err);
      });

    qtyJobs.current[menuItemId] = job;
    await job;
  }

  async function confirmSwitch() {
    if (!pendingItemId) return;
    try {
      await clearCart.mutateAsync();
      setSwitchOpen(false);
      await addToCart.mutateAsync({ menuItemId: pendingItemId, quantity: 1 });
      setPendingItemId(null);
    } catch (err) {
      toastApiError(err);
      setSwitchOpen(false);
      setPendingItemId(null);
    }
  }

  if (restaurant.isLoading || menu.isLoading) {
    return <AppShell>{null}</AppShell>;
  }

  if (restaurant.isError || !restaurant.data) {
    return (
      <AppShell>
        <Link href="/restaurants" className="tg-btn tg-btn-ghost" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to restaurants
        </Link>
      </AppShell>
    );
  }

  const r = restaurant.data;
  const items = menu.data ?? [];

  return (
    <AppShell>
      <Link
        href="/restaurants"
        className="tg-btn tg-btn-ghost"
        style={{ textDecoration: 'none', marginBottom: 14 }}
      >
        <ArrowLeft size={14} /> Back to restaurants
      </Link>

      <div
        className="tg-card"
        style={{
          overflow: 'hidden',
          padding: 0,
          marginBottom: 22,
        }}
      >
        <FoodImage
          imageUrl={r.imageUrl}
          emoji={r.emoji}
          alt={r.name}
          variant="hero"
          height={200}
          borderRadius={0}
        />
        <div style={{ padding: '16px 20px' }}>
          <h1 style={{ fontSize: 19, fontWeight: 500, margin: 0, color: 'var(--tg-text)' }}>
            {r.name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '4px 0 8px' }}>
            {r.cuisine}
            {r.eta ? ` · ${r.eta}` : ''}
            {r.rating != null ? ` · ★ ${r.rating}` : ''} · {r.address}
          </p>
          <DietBadge dietType={r.dietType} />
        </div>
      </div>

      <p className="tg-section-label">Menu</p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingBottom: cartCount > 0 ? 70 : 0,
        }}
      >
        {items.map((m) => {
          const qty = displayQty(m.id);
          return (
            <div
              key={m.id}
              className="tg-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <FoodImage
                  imageUrl={m.imageUrl}
                  alt={m.name}
                  size={48}
                  borderRadius={10}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 14, margin: 0, color: 'var(--tg-text)' }}>
                    {m.name}
                  </p>
                  {m.description ? (
                    <p style={{ fontSize: 12.5, color: 'var(--tg-text-muted)', margin: '3px 0 0' }}>
                      {m.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--tg-text)' }}>
                  {formatInr(m.price)}
                </span>
                {qty > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="tg-qty-btn"
                      aria-label="Decrease"
                      onClick={() => void setQty(m.id, qty - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: 13, minWidth: 14, textAlign: 'center' }}>{qty}</span>
                    <button
                      type="button"
                      className="tg-qty-btn"
                      aria-label="Increase"
                      onClick={() => void setQty(m.id, qty + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="tg-btn tg-btn-secondary tg-btn-sm"
                    onClick={() => void setQty(m.id, 1)}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cartCount > 0 ? (
        <div style={{ position: 'sticky', bottom: 18, marginTop: 18 }}>
          <Link
            href="/cart"
            className="tg-btn tg-btn-primary"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              fontSize: 14,
              boxShadow: 'var(--tg-shadow-md)',
              textDecoration: 'none',
            }}
          >
            View cart · {cartCount} item{cartCount > 1 ? 's' : ''}
          </Link>
        </div>
      ) : null}

      <CartSwitchDialog
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        currentRestaurantName={cart.data?.restaurantName ?? 'another restaurant'}
        onConfirm={() => void confirmSwitch()}
      />
    </AppShell>
  );
}
