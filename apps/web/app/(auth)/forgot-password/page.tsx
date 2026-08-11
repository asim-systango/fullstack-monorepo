'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Request failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Page>
      <ShellHeader title="Forgot password" subtitle="We will email a reset code" />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter the email for your verified BOOKLY account.
          </CardDescription>
        </CardHeader>
        <Form pending={pending} onSubmit={onSubmit}>
          <Field label="Email" htmlFor="forgot-email" required disabled={pending}>
            <TextInput
              id="forgot-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Sending…">
            Send reset code
          </Button>
        </Form>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/login">Back to login</Link>
        </p>
      </Card>
    </Page>
  );
}
