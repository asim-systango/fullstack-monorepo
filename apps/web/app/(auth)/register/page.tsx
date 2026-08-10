'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import {
  Button,
  Field,
  Form,
  TextInput,
  StatusMessage,
  LoadingState,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader, useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState label="Redirecting to dashboard…" />
      </div>
    );
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.register({ name, email, password });
      await authApi.login({ email, password });
      await refresh();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ShellHeader />

      <main className="flex flex-1 items-center justify-center p-6 my-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create your PulseCare Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Register as a patient to book appointments and view your healthcare records
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Form pending={pending} onSubmit={onSubmit}>
              <Field
                label="Full Name"
                htmlFor="register-name"
                required
                disabled={pending}
              >
                <TextInput
                  id="register-name"
                  name="name"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>

              <Field
                label="Email Address"
                htmlFor="register-email"
                required
                disabled={pending}
              >
                <TextInput
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>

              <Field
                label="Password"
                htmlFor="register-password"
                required
                hint="At least 8 characters"
                disabled={pending}
              >
                <TextInput
                  id="register-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                />
              </Field>

              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

              <Button
                type="submit"
                loading={pending}
                loadingText="Creating account…"
                className="w-full bg-foreground text-background hover:opacity-90 mt-2"
              >
                Complete Registration
              </Button>
            </Form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-foreground underline hover:no-underline"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
