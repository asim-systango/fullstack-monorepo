import type { ReactNode } from 'react';
import { cn } from '../cn';

export type StatusMessageProps = Readonly<{
  tone?: 'neutral' | 'error' | 'success';
  children: ReactNode;
  className?: string;
}>;

export function StatusMessage({
  tone = 'neutral',
  children,
  className,
}: StatusMessageProps) {
  return (
    <p
      className={cn(
        'ui-status',
        tone === 'error' && 'ui-status-error',
        tone === 'success' && 'ui-status-success',
        tone === 'neutral' && 'ui-status-neutral',
        className,
      )}
      role={tone === 'error' ? 'alert' : undefined}
    >
      {children}
    </p>
  );
}
