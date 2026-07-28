import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';
import { Spinner } from './spinner';

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md';
    /** Shows spinner, sets `aria-busy`, and disables the button. */
    loading?: boolean;
    /** Optional label while loading (defaults to children). */
    loadingText?: ReactNode;
    children: ReactNode;
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

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'ui-button',
        size === 'sm' && 'ui-button-sm',
        size === 'md' && 'ui-button-md',
        variant === 'primary' && 'ui-button-primary',
        variant === 'secondary' && 'ui-button-secondary',
        variant === 'ghost' && 'ui-button-ghost',
        variant === 'danger' && 'ui-button-danger',
        loading && 'ui-button-loading',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner className="ui-button-spinner" label="Loading" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
