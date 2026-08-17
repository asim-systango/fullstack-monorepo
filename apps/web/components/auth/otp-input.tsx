'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';

const OTP_LENGTH = 6;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export type OtpInputProps = Readonly<{
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}>;

export function OtpInput({
  id,
  value,
  onChange,
  disabled,
  invalid,
  autoFocus = true,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
}: OtpInputProps) {
  const reactId = useId();
  const baseId = id ?? `otp-${reactId}`;
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  const focusIndex = useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus && !disabled) {
      focusIndex(0);
    }
  }, [autoFocus, disabled, focusIndex]);

  const setDigit = useCallback(
    (index: number, digit: string) => {
      const next = digits.slice();
      next[index] = digit;
      onChange(next.join('').slice(0, OTP_LENGTH));
    },
    [digits, onChange],
  );

  function onCellChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const raw = onlyDigits(event.target.value);
    if (!raw) {
      setDigit(index, '');
      return;
    }
    if (raw.length > 1) {
      // Mobile autofill may dump the whole code into one cell
      const full = raw.slice(0, OTP_LENGTH);
      onChange(full);
      focusIndex(Math.min(full.length, OTP_LENGTH - 1));
      return;
    }
    setDigit(index, raw);
    if (index < OTP_LENGTH - 1) focusIndex(index + 1);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '');
      } else if (index > 0) {
        setDigit(index - 1, '');
        focusIndex(index - 1);
      }
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = onlyDigits(event.clipboardData.getData('text')).slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  return (
    <fieldset
      className="auth-otp-grid"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {digits.map((digit, index) => (
        <input
          key={`${baseId}-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          id={index === 0 ? baseId : `${baseId}-${index}`}
          className="auth-otp-cell"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          name={index === 0 ? 'otp' : undefined}
          maxLength={6}
          value={digit}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          onChange={(e) => onCellChange(index, e)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </fieldset>
  );
}
