'use client';

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
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('staff@demo.local');
  const [password, setPassword] = useState('password123');
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
      setError(err instanceof ApiClientError ? err.message : 'Invalid email or password');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Branding Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            INV
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Inventory & Warehouse
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your administrative dashboard
          </p>
        </div>

        {/* Clean Centered Sign-In Card */}
        <Card className="w-full border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Account Login</CardTitle>
            <CardDescription>Enter your email and password to proceed</CardDescription>
          </CardHeader>

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
                placeholder="name@company.com"
                required
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
                placeholder="••••••••"
                required
              />
            </Field>

            {error && (
              <StatusMessage tone="error" className="text-sm">
                {error}
              </StatusMessage>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={pending}
              loadingText="Signing in…"
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
