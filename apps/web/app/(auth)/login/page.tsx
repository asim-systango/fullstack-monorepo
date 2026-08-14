'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  Field,
  Form,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { AuthLayout } from '@/components/splitter';
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

const isProd = process.env.NODE_ENV === 'production';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState(isProd ? '' : 'staff@demo.local');
  const [password, setPassword] = useState(isProd ? '' : 'password123');
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setUnverifiedEmail(null);
    setResendMsg(null);
    try {
      await authApi.login({ email, password });
      await refresh();
      router.push('/groups');
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 403) {
        setUnverifiedEmail(email);
        setError('Please verify your email before signing in.');
      } else {
        setError(err instanceof ApiClientError ? err.message : 'Login failed');
      }
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    if (!unverifiedEmail) return;
    setResendMsg(null);
    try {
      const res = await authApi.resendVerification({ email: unverifiedEmail });
      setResendMsg(res.message);
    } catch {
      setResendMsg(
        'If that email is registered and unverified, we sent a verification link.',
      );
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your shared expenses">
      <Card className="splitter-shadow border-0 sm:border">
        <Form pending={pending} onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" htmlFor="login-email" required disabled={pending}>
            <TextInput
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="Password" htmlFor="login-password" required disabled={pending}>
            <TextInput
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-medium">
              Forgot password?
            </Link>
          </div>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {unverifiedEmail ? (
            <Alert tone="info">
              <p className="text-sm">Check your inbox for a verification link, or</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={() => void resend()}
              >
                resend verification email
              </Button>
              {resendMsg ? <p className="mt-2 text-xs">{resendMsg}</p> : null}
            </Alert>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            loading={pending}
            loadingText="Signing in…"
          >
            Log in
          </Button>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Splitter?{' '}
          <Link href="/register" className="font-medium text-primary">
            Create an account
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
