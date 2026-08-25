'use client';

import Link from 'next/link';
import { Clock, Star } from 'lucide-react';
import { DietBadge, FoodImage } from '@/components/food';
import type { Restaurant } from '@/lib/types/food-delivery';

export function RestaurantCard({ restaurant }: Readonly<{ restaurant: Restaurant }>) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="tg-card tg-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 0,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <FoodImage
        imageUrl={restaurant.imageUrl}
        emoji={restaurant.emoji}
        alt={restaurant.name}
        variant="hero"
        height={168}
        borderRadius={0}
      />
      <div style={{ padding: '14px 16px 16px' }}>
        <p style={{ fontWeight: 500, fontSize: 15, margin: 0, color: 'var(--tg-text)' }}>
          {restaurant.name}
        </p>
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--tg-text-muted)',
            margin: '4px 0 8px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <DietBadge dietType={restaurant.dietType} />
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
      </div>
    </Link>
  );
}
