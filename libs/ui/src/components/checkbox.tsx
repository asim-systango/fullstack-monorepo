'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../cn';
import type { FormControlProps } from '../form-control';

export type CheckboxProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> &
    FormControlProps & {
      label: ReactNode;
    }
>;

export function Checkbox({
  label,
  className,
  id,
  invalid = false,
  disabled,
  required,
  name,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      className={cn(
        'ui-checkbox',
        disabled && 'ui-checkbox-disabled',
        invalid && 'ui-checkbox-invalid',
        className,
      )}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        name={name}
        type="checkbox"
        disabled={disabled}
        required={required}
        aria-invalid={ariaInvalid ?? (invalid || undefined)}
        aria-describedby={ariaDescribedBy}
        className="ui-checkbox-input"
        {...props}
      />
      <span className="ui-checkbox-label">{label}</span>
    </label>
  );
}
