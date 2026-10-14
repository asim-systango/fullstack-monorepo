import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, type = 'text', id, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      id={id}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-md border bg-surface px-3 text-sm text-primary',
        'placeholder:text-tertiary',
        'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand',
        'disabled:cursor-not-allowed disabled:bg-surface-hover disabled:opacity-60',
        invalid ? 'border-danger' : 'border-border-strong hover:border-primary',
        className,
      )}
      {...props}
    />
  );
});
