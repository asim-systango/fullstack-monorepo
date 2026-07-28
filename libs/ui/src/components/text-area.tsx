import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../cn';
import type { FormControlProps } from '../form-control';

export type TextAreaProps = Readonly<
  TextareaHTMLAttributes<HTMLTextAreaElement> & FormControlProps
>;

export function TextArea({
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
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      aria-describedby={ariaDescribedBy}
      className={cn('ui-textarea', invalid && 'ui-control-invalid', className)}
      {...props}
    />
  );
}
