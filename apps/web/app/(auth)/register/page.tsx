'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type SyntheticEvent } from 'react';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Form,
  LoadingState,
  Page,
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader, useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';
import { authPathWithNext, postLoginPath } from '@/lib/auth-redirect';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const nextRaw = searchParams.get('next');

  useEffect(() => {
    if (loading || !user) return;
    router.replace(postLoginPath(nextRaw, user.role));
  }, [loading, user, nextRaw, router]);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.register({ name, email, password });
      const loggedIn = await authApi.login({ email, password });
      await refresh();
      router.push(postLoginPath(nextRaw, loggedIn.role));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Register failed');
    } finally {
      setPending(false);
    }
  }

  if (!loading && user) {
    return <LoadingState label="Redirecting…" />;
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Ink primary CTA · accent only on links and focus.
        </CardDescription>
      </CardHeader>
      <Form pending={pending} onSubmit={onSubmit}>
        <Field label="Name" htmlFor="register-name" required disabled={pending}>
          <TextInput
            id="register-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field label="Email" htmlFor="register-email" required disabled={pending}>
          <TextInput
            id="register-email"
            name="email"
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
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <Button type="submit" loading={pending} loadingText="Creating…">
          Create account
        </Button>
      </Form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already registered? <Link href={authPathWithNext('/login', nextRaw)}>Log in</Link>
      </p>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Page>
      <ShellHeader title="Register" subtitle="Create an account to continue" />
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <RegisterForm />
      </Suspense>
    </Page>
  );
}
