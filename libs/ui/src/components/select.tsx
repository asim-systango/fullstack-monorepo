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
      className={cn('ui-select', invalid && 'ui-control-invalid', className)}
      {...props}
    >
      {children}
    </select>
  );
}
