import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from './cn';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    label,
    hint,
    error,
    id,
    disabled,
    required,
    placeholder = 'Select an option',
    options,
    ...props
  },
  ref,
) {
  const selectId = id ?? props.name;
  let describedBy: string | undefined;
  if (error) {
    describedBy = `${selectId}-error`;
  } else if (hint) {
    describedBy = `${selectId}-hint`;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className={cn(
            'text-sm font-medium text-foreground',
            disabled && 'text-muted-foreground',
          )}
        >
          {label}
          {required ? <span className="text-muted-foreground"> *</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-sm text-foreground transition-colors duration-(--duration-fast) ease-(--ease-standard) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground',
            error ? 'border-red-600' : 'border-border',
            className,
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground"
        >
          ▾
        </span>
      </div>

      {hint && !error ? (
        <p id={`${selectId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
