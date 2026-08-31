import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const toneClasses = {
  info: 'bg-brand-soft text-brand border-brand-muted/40',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
} as const;

export type AlertTone = keyof typeof toneClasses;

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: string;
  action?: ReactNode;
};

export function Alert({
  tone = 'info',
  title,
  action,
  className,
  children,
  role = 'status',
  ...props
}: Readonly<AlertProps>) {
  return (
    <div
      role={role}
      className={cn(
        'flex gap-3 rounded-md border px-3 py-2.5 text-sm',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-0.5')}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-start">{action}</div> : null}
    </div>
  );
}
