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
import { useLogin } from '@/features/auth/hooks/use-auth';

const isProd = process.env.NODE_ENV === 'production';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const loginMutation = useLogin();
  const [email, setEmail] = useState(isProd ? '' : 'patient@hospital.com');
  const [password, setPassword] = useState(isProd ? '' : 'Patient@123');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const role = user.role?.toUpperCase();
      if (role === 'DOCTOR') {
        router.replace('/dashboard');
      } else if (role === 'ADMIN') {
        router.replace('/admin');
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
    setError(null);
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Invalid email or password');
    }
  }

  const fillDemoUser = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
              Quick Demo Accounts
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="xs"
                variant="outline"
                className="gap-1.5"
                onClick={() => fillDemoUser('patient@hospital.com', 'Patient@123')}
              >
                <UserIcon className="size-3.5" /> Patient
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                className="gap-1.5"
                onClick={() => fillDemoUser('doctor2@hospital.com', 'Doctor@123')}
              >
                <Stethoscope className="size-3.5" /> Doctor
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                className="gap-1.5"
                onClick={() => fillDemoUser('admin@hospital.com', 'Admin@123')}
              >
                <Settings className="size-3.5" /> Admin
              </Button>
            </div>
          </Card>

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
                  placeholder="patient@hospital.com"
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

              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

              <Button
                type="submit"
                variant="primary"
                loading={loginMutation.isPending}
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
                Register as Patient
              </Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
