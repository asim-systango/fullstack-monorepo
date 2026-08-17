import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';
import { Spinner } from './spinner';

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
      'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
    /** Shows spinner, sets `aria-busy`, and disables the button. */
    loading?: boolean;
    /** Optional label while loading (defaults to children). */
    loadingText?: ReactNode;
    children?: ReactNode;
  }
>;

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  className,
  children,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs h-7 gap-1',
    sm: 'px-3 py-1.5 text-xs h-8 gap-1.5',
    md: 'px-4 py-2 text-sm h-10 gap-2',
    lg: 'px-6 py-2.5 text-base h-12 gap-2.5',
    icon: 'h-9 w-9 p-0 justify-center',
  };

  const variantClasses = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
    outline:
      'border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground shadow-xs',
    ghost:
      'bg-transparent text-foreground hover:bg-muted hover:text-foreground border border-transparent',
    danger:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-transparent',
    success:
      'bg-success text-success-foreground hover:bg-success/90 shadow-sm border border-transparent',
    link: 'text-accent underline-offset-4 hover:underline p-0 h-auto bg-transparent border-0',
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none',
        sizeClasses[size],
        variantClasses[variant],
        loading && 'gap-2',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner className="size-4 shrink-0" label="Loading" />
          {loadingText || children ? <span>{loadingText ?? children}</span> : null}
        </>
      ) : (
        children
      )}
    </button>
  );
}
