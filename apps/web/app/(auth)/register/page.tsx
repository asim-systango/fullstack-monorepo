'use client';

import Link from 'next/link';
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
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.register({ name, email, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent you a verification link">
        <Alert tone="success">
          <p className="text-sm">
            We sent a verification link to <strong>{email}</strong>. Click the link in the
            email, then come back and log in.
          </p>
        </Alert>
        <Link href="/login" className="mt-6 inline-block">
          <Button>Go to login</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start splitting expenses in seconds"
    >
      <Card className="splitter-shadow border-0 sm:border">
        <Form pending={pending} onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" htmlFor="register-name" required disabled={pending}>
            <TextInput
              id="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Email" htmlFor="register-email" required disabled={pending}>
            <TextInput
              id="register-email"
              type="email"
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
            className="w-full"
            loading={pending}
            loadingText="Creating…"
          >
            Sign up
          </Button>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary">
            Log in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
