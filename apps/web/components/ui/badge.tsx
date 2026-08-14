import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const toneClasses = {
  neutral: 'bg-surface-hover text-secondary',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
} as const;

export type BadgeTone = keyof typeof toneClasses;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: Readonly<BadgeProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
