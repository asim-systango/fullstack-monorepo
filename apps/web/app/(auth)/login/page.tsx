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
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

const isProd = process.env.NODE_ENV === 'production';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState(isProd ? '' : 'user@demo.local');
  const [password, setPassword] = useState(isProd ? '' : 'password123');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.login({ email, password });
      await refresh();
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Page>
      <ShellHeader title="Log in" subtitle="Sign in with your demo account" />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Primary actions use ink. Links and focus rings use accent blue.
          </CardDescription>
        </CardHeader>
        <Form pending={pending} onSubmit={onSubmit}>
          <Field label="Email" htmlFor="login-email" required disabled={pending}>
            <TextInput
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Password" htmlFor="login-password" required disabled={pending}>
            <TextInput
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Signing in…">
            Sign in
          </Button>
        </Form>
        <p className="mt-4 text-sm text-muted-foreground">
          No account? <Link href="/register">Register</Link>
        </p>
      </Card>
    </Page>
  );
}
