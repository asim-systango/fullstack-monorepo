'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import {
  Button,
  Field,
  Form,
  TextInput,
  Card,
  LoadingState,
} from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import { useLogin } from '@/features/auth/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!loading && user) {
      const role = user.role?.toUpperCase();
      if (role === 'DOCTOR') {
        router.replace('/dashboard');
      } else if (role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState label="Redirecting to portal..." />
      </div>
    );
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch {
      // API error toast is automatically displayed by apiClient interceptor
    }
  }

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

          {/* Login Form Card */}
          <Card className="p-6">
            <Form
              pending={loginMutation.isPending}
              onSubmit={onSubmit}
              className="space-y-4"
            >
              <Field
                label="Email Address"
                htmlFor="login-email"
                required
                disabled={loginMutation.isPending}
              >
                <TextInput
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="admin@pulsecare.com"
                />
              </Field>

              <Field
                label="Password"
                htmlFor="login-password"
                required
                disabled={loginMutation.isPending}
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

              <Button
                type="submit"
                variant="primary"
                loading={loginMutation.isPending}
                loadingText="Signing in…"
                className="w-full mt-2 gap-2"
              >
                Sign in to Portal
              </Button>
            </Form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Register
              </Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
