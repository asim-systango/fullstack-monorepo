'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type SyntheticEvent } from 'react';
import {
  Button,
  Field,
  Form,
  LoadingState,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from './auth-provider';
import { authApi } from '@/lib/api';
import { authPathWithNext, postLoginPath } from '@/lib/auth-redirect';

const isProd = process.env.NODE_ENV === 'production';

type FieldErrors = {
  email?: string;
  password?: string;
};

function isValidEmail(value: string): boolean {
  const at = value.indexOf('@');
  if (at <= 0 || value.includes(' ')) return false;
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  return dot > 0 && dot < domain.length - 1;
}

function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length > 128) {
    errors.password = 'Password must be at most 128 characters.';
  }

  return errors;
}

function friendlyLoginError(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Invalid email or password.';
    }
    if (err.statusCode >= 500) {
      return 'Something went wrong. Please try again.';
    }
    if (err.statusCode === 400) {
      return 'Check your email and password and try again.';
    }
    return 'Could not sign in. Please try again.';
  }
  return 'Network error. Check your connection and try again.';
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const [email, setEmail] = useState(isProd ? '' : 'user@demo.local');
  const [password, setPassword] = useState(isProd ? '' : 'password123');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const nextRaw = searchParams.get('next');

  useEffect(() => {
    if (loading || !user) return;
    router.replace(postLoginPath(nextRaw, user.role));
  }, [loading, user, nextRaw, router]);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validateLogin(email, password);
    setFieldErrors(nextErrors);
    setError(null);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setPending(true);
    try {
      const user = await authApi.login({
        email: email.trim(),
        password,
      });
      await refresh();
      router.push(postLoginPath(nextRaw, user.role));
    } catch (err) {
      setError(friendlyLoginError(err));
    } finally {
      setPending(false);
    }
  }

  if (!loading && user) {
    return <LoadingState label="Redirecting…" />;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Welcome Back!
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to continue exploring auctions.
      </p>

      <Form pending={pending} onSubmit={onSubmit} className="mt-6">
        <Field
          label="Email address"
          htmlFor="login-email"
          required
          disabled={pending}
          error={fieldErrors.email}
        >
          <TextInput
            id="login-email"
            name="email"
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="login-password"
          required
          disabled={pending}
          error={fieldErrors.password}
        >
          <div className="flex gap-2">
            <TextInput
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="flex-1"
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
        </Field>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <Button
          type="submit"
          className="w-full"
          loading={pending}
          loadingText="Signing in…"
        >
          Login
        </Button>
      </Form>

      <p className="mt-4 text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href={authPathWithNext('/register', nextRaw)}>Register</Link>
      </p>
    </div>
  );
}
