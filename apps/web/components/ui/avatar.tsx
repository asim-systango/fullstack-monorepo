import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-md',
} as const;

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

export type AvatarSize = keyof typeof sizeClasses;

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  src?: string | null;
  size?: AvatarSize;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return (parts[0]?.slice(0, 2) ?? '?').toUpperCase();
  }
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 'md',
  className,
  ...props
}: Readonly<AvatarProps>) {
  const initials = initialsFromName(name);
  const pixels = sizePixels[size];

  return (
    <div
      aria-label={src ? undefined : name}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={pixels}
          height={pixels}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
