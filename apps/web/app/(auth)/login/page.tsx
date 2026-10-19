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
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { AuthLayout, useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

const isProd = process.env.NODE_ENV === 'production';

function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) return err.message;
    if (err.statusCode >= 500 || err.message.includes('status code')) {
      return 'Server unavailable — start the API with `pnpm dev` and try again.';
    }
    return err.message;
  }
  return 'Login failed';
}

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
      router.push('/projects');
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      headline="Pick up where the board left off."
      lede="Sign in to move issues, leave comments, and keep the team aligned."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Demo roles: staff (lead), user (member), admin (platform view).
          </CardDescription>
        </CardHeader>
        <Form pending={pending} noValidate onSubmit={onSubmit}>
          <Field label="Email" htmlFor="login-email" required disabled={pending}>
            <TextInput
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required={false}
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
              required={false}
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button
            type="submit"
            loading={pending}
            loadingText="Signing in…"
            className="w-full"
          >
            Sign in
          </Button>
        </Form>
        <p className="mt-5 text-sm text-muted-foreground">
          No account? <Link href="/register">Create one</Link>
        </p>
        {!isProd ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Try <code>staff@demo.local</code>, <code>user@demo.local</code>, or{' '}
            <code>admin@demo.local</code> · <code>password123</code>
          </p>
        ) : null}
      </Card>
    </AuthLayout>
  );
}
