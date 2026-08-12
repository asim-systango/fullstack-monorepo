'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  invalid?: boolean;
};

export function PasswordInput({
  className = '',
  invalid = false,
  id,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="tg-password-field">
      <input
        {...rest}
        id={id}
        type={visible ? 'text' : 'password'}
        className={`tg-input tg-input-password${invalid ? ' tg-input-invalid' : ''}${className ? ` ${className}` : ''}`}
        autoComplete={rest.autoComplete ?? 'current-password'}
      />
      <button
        type="button"
        className="tg-password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-controls={id}
        tabIndex={0}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
