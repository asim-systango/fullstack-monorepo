'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { DietBadge, FoodImage } from '@/components/food';
import { useMenuItems, useRestaurant } from '@/lib/hooks/food-delivery';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { formatInr } from '@/lib/pricing';

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default function AdminRestaurantMenuPage({ params }: PageProps) {
  const { id } = use(params);
  const restaurant = useRestaurant(id);
  const menu = useMenuItems(id, false);

  useToastQueryError(restaurant.isError, restaurant.error);
  useToastQueryError(menu.isError, menu.error);

  if (restaurant.isLoading || menu.isLoading) {
    return <AppShell>{null}</AppShell>;
  }

  if (restaurant.isError || !restaurant.data) {
    return (
      <AppShell>
        <Link
          href="/admin/restaurants"
          className="tg-btn tg-btn-ghost"
          style={{ textDecoration: 'none' }}
        >
          <ArrowLeft size={14} /> Back to restaurants
        </Link>
        <p style={{ color: 'var(--tg-danger-fg)', marginTop: 16 }}>Restaurant not found.</p>
      </AppShell>
    );
  }

  const r = restaurant.data;
  const items = menu.data ?? [];

  return (
    <AppShell>
      <Link
        href="/admin/restaurants"
        className="tg-btn tg-btn-ghost"
        style={{ textDecoration: 'none', marginBottom: 14 }}
      >
        <ArrowLeft size={14} /> Back to restaurants
      </Link>

      <div className="tg-card" style={{ overflow: 'hidden', padding: 0, marginBottom: 22 }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((m) => (
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
              <FoodImage imageUrl={m.imageUrl} alt={m.name} size={48} borderRadius={10} />
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
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--tg-text)' }}>
              {formatInr(m.price)}
            </span>
          </div>
        ))}
        {items.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: 'var(--tg-text-faint)',
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            No menu items yet for this restaurant.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
