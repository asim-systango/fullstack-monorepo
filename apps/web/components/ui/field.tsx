import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Label } from '@/components/ui/label';

export type FieldProps = {
  id?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

/** Label + control + hint/error with correct a11y wiring. */
export function Field({
  id,
  label,
  required = false,
  hint,
  error,
  className,
  children,
}: Readonly<FieldProps>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      ) : null}
      {children({ id: fieldId, describedBy, invalid })}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={hintId} className="text-sm text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
