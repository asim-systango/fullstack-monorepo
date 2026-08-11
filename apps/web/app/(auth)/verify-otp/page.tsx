'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Form,
  Page,
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader } from '@/components/auth';
import { authApi } from '@/lib/api';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      await authApi.verifyOtp({ email, otp });
      router.push('/login');
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 503) {
        setError(err.message);
      } else {
        setError(err instanceof ApiClientError ? err.message : 'Verification failed');
      }
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      await authApi.resendOtp({ email, purpose: 'signup' });
      setInfo('If that email can be verified, a new code was sent.');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not resend code');
    } finally {
      setPending(false);
    }
  }

  return (
    <Page>
      <ShellHeader title="Verify email" subtitle="Enter the 6-digit code we sent" />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>
            In local development the OTP is printed in the api-gateway console.
          </CardDescription>
        </CardHeader>
        <Form pending={pending} onSubmit={onSubmit}>
          <Field label="Email" htmlFor="verify-email" required disabled={pending}>
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
            disabled={pending}
          >
            <TextInput
              id="verify-otp"
              name="otp"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              minLength={6}
              maxLength={6}
              autoComplete="one-time-code"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {info ? <StatusMessage tone="success">{info}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Verifying…">
            Verify email
          </Button>
        </Form>
        <p className="mt-4 text-sm text-muted-foreground">
          <button
            type="button"
            className="underline"
            disabled={pending || !email}
            onClick={() => void onResend()}
          >
            Resend code
          </button>
          {' · '}
          <Link href="/login">Back to login</Link>
        </p>
      </Card>
    </Page>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <ShellHeader title="Verify email" subtitle="Loading…" />
        </Page>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
