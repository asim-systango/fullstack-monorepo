'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import { ApiClientError } from '@shared/api-client';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import {
  AuthCard,
  AuthFormFooter,
  AuthLayout,
  AuthPageFallback,
  OtpInput,
  useAuthForm,
  useResendOtp,
} from '@/components/auth';
import { useVerifyOtp } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';
import { useAuthUiStore } from '@/lib/store';
import { verifyOtpSchema } from '@/lib/validation/auth';

const RESEND_INFO = 'If that email can be verified, a new code was sent.';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtp = useVerifyOtp();
  const pendingEmail = useAuthUiStore((s) => s.pendingEmail);
  const setPendingEmail = useAuthUiStore((s) => s.setPendingEmail);
  const { pending, error, setError, fieldErrors, submit } = useAuthForm();
  const { resending, info, setInfo, resend, cooldownSec, canResend } = useResendOtp(
    'signup',
    RESEND_INFO,
    { startCooldownOnMount: Boolean(searchParams.get('email') || pendingEmail) },
  );
  const [email, setEmail] = useState(searchParams.get('email') ?? pendingEmail ?? '');
  const [otp, setOtp] = useState('');

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfo(null);
    await submit({
      schema: verifyOtpSchema,
      values: { email, otp },
      onValid: async (values) => {
        await verifyOtp.mutateAsync(values);
        setPendingEmail(null);
        router.push(ROUTES.login);
      },
      onError: (err) => {
        if (err instanceof ApiClientError && err.statusCode === 503) {
          setError(err.message);
          return true;
        }
        return false;
      },
    });
  }

  const busy = pending || resending;
  let resendLabel = 'Resend code';
  if (cooldownSec > 0) resendLabel = `Resend in ${cooldownSec}s`;
  else if (resending) resendLabel = 'Sending…';

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to complete registration."
    >
      <AuthCard title="Email verification">
        <Form pending={busy} onSubmit={onSubmit}>
          <Field
            label="Email address"
            htmlFor="verify-email"
            required
            disabled={busy}
            error={fieldErrors.email}
          >
            <TextInput
              id="verify-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field
            label="Verification code"
            htmlFor="verify-otp"
            required
            disabled={busy}
            error={fieldErrors.otp}
          >
            <OtpInput
              id="verify-otp"
              value={otp}
              onChange={setOtp}
              disabled={busy}
              invalid={Boolean(fieldErrors.otp)}
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {info ? <StatusMessage tone="success">{info}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Verifying…">
            Verify email →
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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<AuthPageFallback title="Verify your email" />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
