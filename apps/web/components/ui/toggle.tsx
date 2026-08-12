'use client';

import { forwardRef, useId, useState, type ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    className,
    label,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    id,
    onClick,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const toggleId = id ?? generatedId;
  const isControlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isOn = isControlled ? checked : uncontrolledChecked;

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <button
        ref={ref}
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const next = !isOn;
          if (!isControlled) setUncontrolledChecked(next);
          onCheckedChange?.(next);
        }}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border transition-colors duration-(--duration-fast) ease-(--ease-standard) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          isOn ? 'border-brand bg-brand' : 'border-border bg-surface-muted',
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform duration-(--duration-fast) ease-(--ease-standard)',
            isOn ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </button>

      {label ? (
        <label htmlFor={toggleId} className="text-sm text-foreground">
          {label}
        </label>
      ) : null}
    </div>
  );
});
