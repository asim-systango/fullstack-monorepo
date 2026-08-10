import type { SelectHTMLAttributes } from 'react';
import { cn } from '../cn';
import type { FormControlProps } from '../form-control';

export type SelectProps = Readonly<
  SelectHTMLAttributes<HTMLSelectElement> & FormControlProps
>;

export function Select({
  className,
  invalid = false,
  disabled,
  required,
  name,
  id,
  children,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SelectProps) {
  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      required={required}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      aria-describedby={ariaDescribedBy}
      className={cn(
        'w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        invalid && 'border-destructive focus-visible:ring-destructive',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
