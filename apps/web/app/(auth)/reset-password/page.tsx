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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      router.push('/login');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Reset failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Page>
      <ShellHeader title="Reset password" subtitle="Enter the code and a new password" />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>
            Use the 6-digit code from your email (or gateway console in local dev).
          </CardDescription>
        </CardHeader>
        <Form pending={pending} onSubmit={onSubmit}>
          <Field label="Email" htmlFor="reset-email" required disabled={pending}>
            <TextInput
              id="reset-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Reset code" htmlFor="reset-otp" required disabled={pending}>
            <TextInput
              id="reset-otp"
              name="otp"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              minLength={6}
              maxLength={6}
              autoComplete="one-time-code"
            />
          </Field>
          <Field
            label="New password"
            htmlFor="reset-password"
            required
            hint="At least 8 characters"
            disabled={pending}
          >
            <TextInput
              id="reset-password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Saving…">
            Update password
          </Button>
        </Form>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/login">Back to login</Link>
        </p>
      </Card>
    </Page>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <ShellHeader title="Reset password" subtitle="Loading…" />
        </Page>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
