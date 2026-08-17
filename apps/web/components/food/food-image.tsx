'use client';

import type { CSSProperties } from 'react';

type FoodImageProps = Readonly<{
  imageUrl?: string | null;
  emoji?: string | null;
  alt: string;
  size?: number;
  height?: number;
  borderRadius?: number;
  variant?: 'avatar' | 'hero';
  style?: CSSProperties;
}>;

export function FoodImage({
  imageUrl,
  emoji,
  alt,
  size = 54,
  height = 160,
  borderRadius = 12,
  variant = 'avatar',
  style,
}: FoodImageProps) {
  if (variant === 'hero') {
    const heroStyle: CSSProperties = {
      width: '100%',
      height,
      borderRadius,
      background: 'var(--tg-brand-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 48,
      overflow: 'hidden',
      ...style,
    };

    if (imageUrl) {
      return (
        <div style={heroStyle}>
          <img
            src={imageUrl}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      );
    }

    return <div style={heroStyle}>{emoji ?? '🍽️'}</div>;
  }

  const baseStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    background: 'var(--tg-brand-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: Math.round(size * 0.44),
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (imageUrl) {
    return (
      <div style={baseStyle}>
        <img
          src={imageUrl}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return <div style={baseStyle}>{emoji ?? '🍽️'}</div>;
}
