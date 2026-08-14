'use client';

import { useState, type ChangeEvent } from 'react';
import { TextInput } from '@shared/ui/components';

export type PasswordFieldProps = Readonly<{
  id?: string;
  name?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  minLength?: number;
  maxLength?: number;
  'aria-describedby'?: string;
}>;

export function PasswordField({
  id,
  name,
  value,
  onChange,
  autoComplete,
  disabled,
  required,
  invalid,
  minLength,
  maxLength,
  'aria-describedby': ariaDescribedBy,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible ? 'Hide password' : 'Show password';

  return (
    <div className="relative">
      <TextInput
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        invalid={invalid}
        minLength={minLength}
        maxLength={maxLength}
        aria-describedby={ariaDescribedBy}
        className="pr-16"
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={toggleLabel}
        aria-pressed={visible}
        disabled={disabled}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
