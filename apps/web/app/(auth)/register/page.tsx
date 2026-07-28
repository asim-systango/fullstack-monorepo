'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button, Card, Field, TextInput, StatusMessage } from '@shared/ui';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader } from '@/components/auth/shell-header';
import { useAuth } from '@/components/auth/auth-provider';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await authApi.register({ name, email, password });
      await authApi.login({ email, password });
      await refresh();
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Register failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
      <ShellHeader title="Register" />
      <Card className="max-w-md">
        <form onSubmit={onSubmit}>
          <Field label="Name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Password (min 8)">
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
