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
  LoadingState,
  Page,
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader, useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

const isProd = process.env.NODE_ENV === 'production';

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/auctions';
  }
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push(safeNextPath(searchParams.get('next')));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to bid, sell, or manage auctions. Demo password: password123
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
  );
}

export default function LoginPage() {
  return (
    <Page>
      <ShellHeader title="Log in" subtitle="Sign in with your demo account" />
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <LoginForm />
      </Suspense>
    </Page>
  );
}
