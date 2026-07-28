import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger';

export type BadgeProps = Readonly<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: BadgeTone;
    children: ReactNode;
  }
>;

export function Badge({ tone = 'neutral', children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'ui-badge',
        tone === 'neutral' && 'ui-badge-neutral',
        tone === 'accent' && 'ui-badge-accent',
        tone === 'success' && 'ui-badge-success',
        tone === 'danger' && 'ui-badge-danger',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
