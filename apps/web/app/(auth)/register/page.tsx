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
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { AuthLayout, useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';

type FieldErrors = Partial<Record<'name' | 'email' | 'password', string>>;

function registerErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 409) return err.message;
    if (err.statusCode >= 500 || err.message.includes('status code')) {
      return 'Server unavailable — start the API with `pnpm dev` and try again.';
    }
    return err.message;
  }
  return 'Register failed';
}

function fieldErrorsFromApi(err: unknown): FieldErrors {
  if (!(err instanceof ApiClientError) || !err.body.details?.length) return {};
  const out: FieldErrors = {};
  for (const detail of err.body.details) {
    const key = detail.field.split('.').pop();
    if (key === 'name' || key === 'email' || key === 'password') {
      out[key] = detail.message;
    }
  }
  return out;
}

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});
    try {
      await authApi.register({ email, password, name });
      await refresh();
      router.replace('/projects');
    } catch (err) {
      const fields = fieldErrorsFromApi(err);
      setFieldErrors(fields);
      // 400 validation → field messages only; 409/5xx → banner.
      const isFieldValidation =
        err instanceof ApiClientError &&
        err.statusCode === 400 &&
        Object.keys(fields).length > 0;
      setError(isFieldValidation ? null : registerErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      headline="Join the board your team already uses."
      lede="Create an account to track issues, comment in context, and ship together."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Create account</CardTitle>
          <CardDescription>
            Email and password — name shows on comments and activity.
          </CardDescription>
        </CardHeader>
        <Form pending={pending} noValidate onSubmit={onSubmit}>
          <Field
            label="Name"
            htmlFor="register-name"
            required
            disabled={pending}
            error={fieldErrors.name}
          >
            <TextInput
              id="register-name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name)
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              autoComplete="name"
              required={false}
            />
          </Field>
          <Field
            label="Email"
            htmlFor="register-email"
            required
            disabled={pending}
            error={fieldErrors.email}
          >
            <TextInput
              id="register-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email)
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              autoComplete="email"
              required={false}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="register-password"
            required
            disabled={pending}
            hint="At least 8 characters"
            error={fieldErrors.password}
          >
            <TextInput
              id="register-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              autoComplete="new-password"
              required={false}
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button
            type="submit"
            loading={pending}
            loadingText="Creating…"
            className="w-full"
          >
            Create account
          </Button>
        </Form>
        <p className="mt-5 text-sm text-muted-foreground">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
