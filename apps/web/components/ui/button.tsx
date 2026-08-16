import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

const variants = {
  primary:
    'bg-button-primary text-button-primary-foreground hover:bg-foreground disabled:opacity-50',
  brand: 'bg-brand text-brand-foreground hover:bg-brand-hover disabled:opacity-50',
  outline:
    'border border-border-strong bg-background text-foreground hover:bg-surface-muted disabled:opacity-50',
  ghost: 'bg-transparent text-foreground hover:bg-surface-muted disabled:opacity-50',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-11 px-6 text-base',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'Loading…',
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
        'inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors duration-(--duration-fast) ease-(--ease-standard) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
});
