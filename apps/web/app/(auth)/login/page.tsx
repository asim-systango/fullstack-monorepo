'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import { User as UserIcon, Stethoscope, Settings, ArrowRight } from 'lucide-react';
import {
  Button,
  Field,
  Form,
  TextInput,
  StatusMessage,
  Card,
  LoadingState,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader, useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

const isProd = process.env.NODE_ENV === 'production';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [email, setEmail] = useState(isProd ? '' : 'user@demo.local');
  const [password, setPassword] = useState(isProd ? '' : 'password123');
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
            <p className="mt-2 text-xs text-muted-foreground">
              Sign in to manage your appointments, schedules, or medical records
            </p>
          </div>

          {/* Quick Demo Preset Chips */}
          <Card className="bg-muted/30 p-4 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Quick Demo Login
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="xs"
                variant="outline"
                className="gap-1.5"
                onClick={() => fillDemoUser('user@demo.local')}
              >
                <UserIcon className="size-3.5" /> Patient
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                className="gap-1.5"
                onClick={() => fillDemoUser('staff@demo.local')}
              >
                <Stethoscope className="size-3.5" /> Doctor
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                className="gap-1.5"
                onClick={() => fillDemoUser('admin@demo.local')}
              >
                <Settings className="size-3.5" /> Admin
              </Button>
            </div>
          </Card>

          {/* Login Form Card */}
          <Card className="p-6">
            <Form pending={pending} onSubmit={onSubmit} className="space-y-4">
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
                  placeholder="name@domain.com"
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
                  placeholder="••••••••"
                />
              </Field>

              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

              <Button
                type="submit"
                variant="primary"
                loading={pending}
                loadingText="Signing in…"
                className="w-full mt-2 gap-2"
              >
                Sign in to Portal <ArrowRight className="size-4" />
              </Button>
            </Form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
