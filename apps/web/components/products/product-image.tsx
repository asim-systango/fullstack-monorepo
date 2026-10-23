'use client';

import { useState } from 'react';

export type ProductImageSize = 'sm' | 'md' | 'lg' | 'detail' | 'preview' | 'table';

export type ProductImageProps = Readonly<{
  src?: string | null;
  alt: string;
  size?: ProductImageSize;
  className?: string;
}>;

const SIZE_MAP: Record<ProductImageSize, { wrapper: string; icon: string }> = {
  sm: { wrapper: 'h-8 w-8 rounded-lg', icon: 'text-xs' },
  table: { wrapper: 'h-11 w-11 rounded-xl', icon: 'text-sm' },
  md: { wrapper: 'h-14 w-14 rounded-xl', icon: 'text-base' },
  preview: { wrapper: 'h-20 w-20 rounded-2xl', icon: 'text-2xl' },
  lg: { wrapper: 'h-28 w-28 rounded-2xl', icon: 'text-3xl' },
  detail: { wrapper: 'h-52 w-52 sm:h-64 sm:w-64 rounded-3xl', icon: 'text-5xl' },
};

export function ProductImage({
  src,
  alt,
  size = 'table',
  className = '',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP.table;
  const showFallback = !src || hasError;

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-border/80 bg-muted/30 shadow-2xs flex items-center justify-center ${sizeConfig.wrapper} ${className}`}
    >
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-slate-400 select-none">
          <span className={sizeConfig.icon} aria-hidden="true">
            📦
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      )}
    </div>
  );
}
