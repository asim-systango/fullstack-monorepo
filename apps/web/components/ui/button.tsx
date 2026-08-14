import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/spinner';

const variantClasses = {
  primary:
    'bg-brand text-inverse hover:bg-brand-hover active:bg-brand-pressed border border-transparent',
  secondary:
    'bg-surface text-brand border border-brand hover:bg-brand-soft active:bg-brand-soft',
  outline:
    'bg-surface text-primary border border-border-strong hover:bg-surface-hover active:bg-surface-hover',
  ghost:
    'bg-transparent text-secondary border border-transparent hover:bg-surface-hover hover:text-primary',
  danger:
    'bg-danger text-inverse border border-transparent hover:opacity-90 active:opacity-80',
  link: 'bg-transparent text-link border-transparent underline-offset-2 hover:underline px-0 h-auto',
} as const;

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-md',
  icon: 'h-10 w-10 p-0',
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : null}
      {children}
    </button>
  );
});
