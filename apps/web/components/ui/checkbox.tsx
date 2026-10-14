import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  invalid?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, invalid = false, id, disabled, ...props },
  ref,
) {
  const control = (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        'size-4 shrink-0 rounded-sm border border-border-strong text-brand accent-brand',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:cursor-not-allowed disabled:opacity-60',
        invalid && 'border-danger',
        className,
      )}
      {...props}
    />
  );

  if (!label) {
    return control;
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-start gap-2 text-sm text-primary',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      {control}
      <span className="leading-snug">{label}</span>
    </label>
  );
});
