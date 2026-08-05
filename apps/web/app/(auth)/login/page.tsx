'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { Button, Field, Form, TextInput, StatusMessage } from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader, useAuth } from '@/components/auth';
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
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  }

  const fillDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ShellHeader />

      <main className="flex flex-1 items-center justify-center p-6 my-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back to PulseCare
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your appointments, schedules, or medical records
            </p>
          </div>

          {/* Quick Demo Preset Chips */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Quick Demo Login
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoUser('user@demo.local')}
                className="rounded border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                👤 Patient
              </button>
              <button
                type="button"
                onClick={() => fillDemoUser('staff@demo.local')}
                className="rounded border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => fillDemoUser('admin@demo.local')}
                className="rounded border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                ⚙️ Admin
              </button>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Form pending={pending} onSubmit={onSubmit}>
              <Field
                label="Email Address"
                htmlFor="login-email"
                required
                disabled={pending}
              >
                <TextInput
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>

              <Field
                label="Password"
                htmlFor="login-password"
                required
                disabled={pending}
              >
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

              <Button
                type="submit"
                loading={pending}
                loadingText="Signing in…"
                className="w-full bg-foreground text-background hover:opacity-90 mt-2"
              >
                Sign in to Portal
              </Button>
            </Form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-foreground underline hover:no-underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
