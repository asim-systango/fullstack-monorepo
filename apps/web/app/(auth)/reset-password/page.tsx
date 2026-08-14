'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import {
  AuthCard,
  AuthFormFooter,
  AuthLayout,
  AuthPageFallback,
  OtpInput,
  PasswordField,
  useAuthForm,
  useResendOtp,
} from '@/components/auth';
import { useResetPassword } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';
import { useAuthUiStore } from '@/lib/store';
import { PASSWORD_HINT, resetPasswordSchema } from '@/lib/validation/auth';

const RESEND_INFO = 'If a reset is possible, a new code was sent.';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPassword = useResetPassword();
  const pendingEmail = useAuthUiStore((s) => s.pendingEmail);
  const setPendingEmail = useAuthUiStore((s) => s.setPendingEmail);
  const { pending, error, setError, fieldErrors, submit } = useAuthForm();
  const { resending, info, setInfo, resend, cooldownSec, canResend } = useResendOtp(
    'password_reset',
    RESEND_INFO,
    { startCooldownOnMount: Boolean(searchParams.get('email') || pendingEmail) },
  );
  const [email, setEmail] = useState(searchParams.get('email') ?? pendingEmail ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfo(null);
    await submit({
      schema: resetPasswordSchema,
      values: { email, otp, newPassword, confirmPassword },
      onValid: async (values) => {
        await resetPassword.mutateAsync({
          email: values.email,
          otp: values.otp,
          newPassword: values.newPassword,
        });
        setPendingEmail(null);
        router.push(ROUTES.login);
      },
    });
  }

  const busy = pending || resending;
  let resendLabel = 'Resend code';
  if (cooldownSec > 0) resendLabel = `Resend in ${cooldownSec}s`;
  else if (resending) resendLabel = 'Sending…';

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter the 6-digit code from your email, then set a new password."
    >
      <AuthCard title="Reset password">
        <Form pending={busy} onSubmit={onSubmit}>
          <Field
            label="Email address"
            htmlFor="reset-email"
            required
            disabled={busy}
            error={fieldErrors.email}
          >
            <TextInput
              id="reset-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field
            label="Reset code"
            htmlFor="reset-otp"
            required
            disabled={busy}
            error={fieldErrors.otp}
          >
            <OtpInput
              id="reset-otp"
              value={otp}
              onChange={setOtp}
              disabled={busy}
              invalid={Boolean(fieldErrors.otp)}
            />
          </Field>
          <Field
            label="New password"
            htmlFor="reset-password"
            required
            hint={PASSWORD_HINT}
            disabled={busy}
            error={fieldErrors.newPassword}
          >
            <PasswordField
              id="reset-password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Field
            label="Confirm password"
            htmlFor="reset-confirm"
            required
            disabled={busy}
            error={fieldErrors.confirmPassword}
          >
            <PasswordField
              id="reset-confirm"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {info ? <StatusMessage tone="success">{info}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Saving…">
            Update password →
          </Button>
        </Form>
        <AuthFormFooter>
          <button
            type="button"
            disabled={!canResend || !email}
            onClick={() => void resend(email, setError)}
          >
            {resendLabel}
          </button>
          {' · '}
          <Link href={ROUTES.login}>Back to login</Link>
        </AuthFormFooter>
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPageFallback title="Choose a new password" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
