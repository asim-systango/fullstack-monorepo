'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import {
  Button,
  Card,
  Field,
  Form,
  Spinner,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { AuthLayout } from '@/components/splitter';
import { authApi } from '@/lib/api';

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await authApi.resetPassword({ token, password });
      router.push('/login');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Reset failed');
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <StatusMessage tone="error">This reset link is missing a token.</StatusMessage>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password">
      <Card className="splitter-shadow border-0 sm:border">
        <Form pending={pending} onSubmit={onSubmit} className="space-y-4">
          <Field label="New password" htmlFor="new-password" required>
            <TextInput
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirm-password" required>
            <TextInput
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" className="w-full" loading={pending}>
            Update password
          </Button>
        </Form>
      </Card>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner label="Loading" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
