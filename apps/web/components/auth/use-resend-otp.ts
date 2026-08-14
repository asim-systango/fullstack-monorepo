'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClientError } from '@shared/api-client';
import { toUserMessage } from '@/lib/auth/errors';
import { useResendOtp as useResendOtpMutation } from '@/lib/auth/hooks';

/** Matches backend `OTP_COOLDOWN_MS` (60s). */
export const OTP_RESEND_COOLDOWN_SEC = 60;

export function useResendOtp(
  purpose: 'signup' | 'password_reset',
  successMessage: string,
  options?: { startCooldownOnMount?: boolean },
) {
  const startOnMount = options?.startCooldownOnMount ?? false;
  const resendMutation = useResendOtpMutation();
  const [info, setInfo] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState(
    startOnMount ? OTP_RESEND_COOLDOWN_SEC : 0,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(
    (seconds = OTP_RESEND_COOLDOWN_SEC) => {
      clearTimer();
      setCooldownSec(seconds);
      timerRef.current = setInterval(() => {
        setCooldownSec((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer],
  );

  useEffect(() => {
    if (startOnMount) {
      startCooldown(OTP_RESEND_COOLDOWN_SEC);
    }
    return clearTimer;
  }, []);

  const resend = useCallback(
    async (email: string, setError: (message: string | null) => void) => {
      if (!email || resendMutation.isPending || cooldownSec > 0) return;
      setError(null);
      setInfo(null);
      try {
        await resendMutation.mutateAsync({ email, purpose });
        setInfo(successMessage);
        startCooldown();
      } catch (err) {
        const message = toUserMessage(err);
        setError(message);
        if (
          err instanceof ApiClientError &&
          err.statusCode === 400 &&
          message.toLowerCase().includes('wait')
        ) {
          startCooldown();
        }
      }
    },
    [purpose, successMessage, resendMutation, cooldownSec, startCooldown],
  );

  return {
    resending: resendMutation.isPending,
    info,
    setInfo,
    resend,
    cooldownSec,
    canResend: cooldownSec === 0 && !resendMutation.isPending,
  };
}
