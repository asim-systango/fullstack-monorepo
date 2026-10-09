'use client';

import Link from 'next/link';
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
  Page,
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'staff' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      // Client-side validation
      if (!name || name.length < 1)
        throw new ApiClientError({
          statusCode: 400,
          error: 'BadRequest',
          message: 'Name required',
        });
      if (!email)
        throw new ApiClientError({
          statusCode: 400,
          error: 'BadRequest',
          message: 'Valid email required',
        });
      if (!password || password.length < 8)
        throw new ApiClientError({
          statusCode: 400,
          error: 'BadRequest',
          message: 'Password must be at least 8 characters',
        });
      await authApi.register({ name, email, password, role });
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
    <Page>
      {/* <ShellHeader title="Register" subtitle="Create an account to continue" /> */}
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
          <Field label="Role" htmlFor="register-role" required disabled={pending}>
            <select
              id="register-role"
              name="role"
              value={role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setRole(e.target.value as 'user' | 'staff' | 'admin')
              }
              className="ui-select"
            >
              <option value="user">Student</option>
              <option value="staff">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Creating…">
            Create account
          </Button>
        </Form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </Card>
    </Page>
  );
}
