'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../cn';
import type { FormControlProps } from '../form-control';
import { TextInput, type TextInputProps } from './text-input';

export type PasswordInputProps = Readonly<
  Omit<TextInputProps, 'type'> & FormControlProps
>;

/** `TextInput` with a show/hide toggle — the one password control for the app. */
export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="ui-password-input">
      <TextInput
        {...props}
        disabled={disabled}
        type={visible ? 'text' : 'password'}
        className={cn('ui-password-input-control', className)}
      />
      <button
        type="button"
        className="ui-password-input-toggle"
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? (
          <EyeOff aria-hidden="true" size={18} className="cursor-pointer" />
        ) : (
          <Eye aria-hidden="true" size={18} className="cursor-pointer" />
        )}
      </button>
    </div>
  );
}
