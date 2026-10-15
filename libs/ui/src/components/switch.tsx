'use client';

import { type InputHTMLAttributes } from 'react';
import { cn } from '../cn';

export type SwitchProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    label?: string;
  }
>;

export function Switch({
  label,
  checked,
  disabled,
  className,
  id,
  onChange,
  ...rest
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 select-none text-sm font-medium text-foreground',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div className="relative inline-block h-6 w-11 shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
          {...rest}
        />
        <div className="h-6 w-11 rounded-full bg-muted transition-colors duration-200 ease-in-out peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background" />
        <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
      </div>
      {label ? <span>{label}</span> : null}
    </label>
  );
}
