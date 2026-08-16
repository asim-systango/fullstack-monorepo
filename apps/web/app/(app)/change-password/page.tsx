'use client';

import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Form, PageHeader, StatusMessage } from '@shared/ui/components';
import { OtpInput, PasswordField, useAuth, useAuthForm } from '@/components/auth';
import { OTP_RESEND_COOLDOWN_SEC } from '@/components/auth/use-resend-otp';
import { toUserMessage } from '@/lib/auth/errors';
import { useChangePassword, useChangePasswordOtp } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';
import {
  changePasswordOtpSchema,
  changePasswordSchema,
  PASSWORD_HINT,
} from '@/lib/validation/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const forced = Boolean(user?.mustChangePassword);
  const requestOtp = useChangePasswordOtp();
  const changePassword = useChangePassword();
  const { pending, error, setError, fieldErrors, submit } = useAuthForm();
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    },
    [],
  );

  function startCooldown() {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    setCooldownSec(OTP_RESEND_COOLDOWN_SEC);
    cooldownTimer.current = setInterval(() => {
      setCooldownSec((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) {
            clearInterval(cooldownTimer.current);
            cooldownTimer.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function sendCode() {
    await requestOtp.mutateAsync({ currentPassword });
    setInfo('A verification code was sent to your email.');
    startCooldown();
    setStep('otp');
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfo(null);

    if (step === 'password') {
      await submit({
        schema: changePasswordSchema,
        values: { currentPassword, newPassword, confirmPassword },
        onValid: async () => {
          await sendCode();
        },
      });
      return;
    }

    await submit({
      schema: changePasswordOtpSchema,
      values: { currentPassword, newPassword, confirmPassword, otp },
      onValid: async (values) => {
        await changePassword.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          otp: values.otp,
        });
        try {
          await logout();
        } catch {
          /* session already cleared by the API */
        }
        router.replace(ROUTES.login);
        router.refresh();
      },
    });
  }

  async function onResend() {
    if (cooldownSec > 0 || pending) return;
    setError(null);
    setInfo(null);
    try {
      await sendCode();
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  const busy = pending || requestOtp.isPending;
  let resendLabel = 'Resend code';
  if (cooldownSec > 0) resendLabel = `Resend in ${cooldownSec}s`;
  else if (requestOtp.isPending && step === 'otp') resendLabel = 'Sending…';

  let description =
    'Choose a new password. We will email a verification code, then you will log in again.';
  if (step === 'otp') {
    description =
      'Enter the 6-digit code we sent to your email, then you will be asked to log in again.';
  } else if (forced) {
    description = 'Set a new password. We will email a verification code before it is saved.';
  }

  return (
    <div className="member-content">
      <div className="max-w-md">
        <PageHeader title="Change password" description={description} />
        <Form pending={busy} onSubmit={onSubmit}>
          <Field
            label="Current password"
            htmlFor="current-password"
            required
            disabled={busy || step === 'otp'}
            error={fieldErrors.currentPassword}
          >
            <PasswordField
              id="current-password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field
            label="New password"
            htmlFor="new-password"
            required
            hint={PASSWORD_HINT}
            disabled={busy || step === 'otp'}
            error={fieldErrors.newPassword}
          >
            <PasswordField
              id="new-password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Field
            label="Confirm new password"
            htmlFor="confirm-new-password"
            required
            disabled={busy || step === 'otp'}
            error={fieldErrors.confirmPassword}
          >
            <PasswordField
              id="confirm-new-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          {step === 'otp' ? (
            <Field
              label="Verification code"
              htmlFor="change-password-otp"
              required
              disabled={busy}
              error={fieldErrors.otp}
            >
              <OtpInput
                id="change-password-otp"
                value={otp}
                onChange={setOtp}
                disabled={busy}
                invalid={Boolean(fieldErrors.otp)}
              />
            </Field>
          ) : null}
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {info ? <StatusMessage tone="success">{info}</StatusMessage> : null}
          {step === 'otp' ? (
            <>
              <Button type="submit" loading={pending} loadingText="Verifying…">
                Verify and update password
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy || cooldownSec > 0}
                onClick={() => void onResend()}
              >
                {resendLabel}
              </Button>
            </>
          ) : (
            <Button type="submit" loading={busy} loadingText="Sending code…">
              Send verification code
            </Button>
          )}
        </Form>
      </div>
    </div>
  );
}
