'use client';

import Link from 'next/link';
import { Clock, Star } from 'lucide-react';
import type { Restaurant } from '@/lib/types/food-delivery';

export function RestaurantCard({ restaurant }: Readonly<{ restaurant: Restaurant }>) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="tg-card tg-card-hover"
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        padding: '16px 18px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          background: 'var(--tg-brand-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {restaurant.emoji ?? '🍽️'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 500, fontSize: 14.5, margin: 0, color: 'var(--tg-text)' }}>
          {restaurant.name}
        </p>
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--tg-text-muted)',
            margin: '3px 0 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span>{restaurant.cuisine}</span>
          {restaurant.eta ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={12} /> {restaurant.eta}
            </span>
          ) : null}
        </p>
        {restaurant.rating != null ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--tg-rating)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Star size={12} fill="currentColor" /> {restaurant.rating}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
