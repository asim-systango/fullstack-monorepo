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
import { authApi } from '@/lib/api';
import { pathAfterLogin } from '@/lib/auth/routing';
import { ShellHeader } from './shell-header';
import { useAuth } from './auth-provider';

const isProd = process.env.NODE_ENV === 'production';

export function LoginForm({ next }: Readonly<{ next: string | null }>) {
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
      const user = await authApi.login({ email, password });
      await refresh();
      router.replace(pathAfterLogin(user.role, next));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Page>
      <ShellHeader title="Log in" subtitle="Leave management" />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            {isProd
              ? 'Sign in to apply for leave and see your balance.'
              : 'Demo accounts: user@, asha@, staff@ or admin@demo.local · password123'}
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
