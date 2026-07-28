import type { InputHTMLAttributes } from 'react';
import { cn } from '../cn';
import type { FormControlProps } from '../form-control';

export type TextInputProps = Readonly<
  InputHTMLAttributes<HTMLInputElement> & FormControlProps
>;

export function TextInput({
  className,
  invalid = false,
  disabled,
  readOnly,
  required,
  name,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...props
}: TextInputProps) {
  return (
    <input
      id={id}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      aria-describedby={ariaDescribedBy}
      className={cn('ui-input', invalid && 'ui-control-invalid', className)}
      {...props}
    />
  );
}
