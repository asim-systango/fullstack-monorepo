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
      className={cn(
        'min-h-24 w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-xs transition-all duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted',
        invalid && 'border-destructive focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  );
}
