import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

export type BadgeTone =
  'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'outline';

export type BadgeProps = Readonly<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: BadgeTone;
    children: ReactNode;
  }
>;

export function Badge({ tone = 'neutral', children, className, ...rest }: BadgeProps) {
  const toneClasses = {
    neutral: 'bg-muted text-muted-foreground border-transparent',
    accent: 'bg-accent/15 text-accent border-accent/20',
    success: 'bg-success/15 text-success border-success/20',
    danger: 'bg-destructive/15 text-destructive border-destructive/20',
    warning: 'bg-warning/15 text-warning-foreground border-warning/20',
    outline: 'bg-transparent text-foreground border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
