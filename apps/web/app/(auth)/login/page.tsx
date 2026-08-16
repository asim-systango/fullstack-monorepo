'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import { ApiClientError } from '@shared/api-client';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import {
  AuthCard,
  AuthFormFooter,
  AuthLayout,
  AuthPageFallback,
  PasswordField,
  useAuth,
  useAuthForm,
} from '@/components/auth';
import { isEmailUnverifiedError } from '@/lib/auth/errors';
import { useLogin } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';
import { getSafeNextPath } from '@/lib/auth/safe-next';
import { useAuthUiStore } from '@/lib/store';
import { loginSchema } from '@/lib/validation/auth';

const isProd = process.env.NODE_ENV === 'production';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSessionUser } = useAuth();
  const login = useLogin();
  const setPendingEmail = useAuthUiStore((s) => s.setPendingEmail);
  const { pending, error, setError, fieldErrors, submit } = useAuthForm();
  const [email, setEmail] = useState(isProd ? '' : 'user@demo.local');
  const [password, setPassword] = useState(isProd ? '' : 'password123');

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    await submit({
      schema: loginSchema,
      values: { email, password },
      onValid: async (values) => {
        const tokens = await login.mutateAsync(values);
        setSessionUser(tokens.user);
        if (tokens.user.mustChangePassword) {
          router.push(ROUTES.changePassword);
        } else {
          router.push(getSafeNextPath(searchParams.get('next')));
        }
        router.refresh();
      },
      onError: (err) => {
        if (isEmailUnverifiedError(err)) {
          setPendingEmail(email);
          router.push(`${ROUTES.verifyOtp}?email=${encodeURIComponent(email)}`);
          return true;
        }
        if (err instanceof ApiClientError && err.statusCode === 503) {
          setError('Library profile setup is temporarily unavailable. Please try again.');
          return true;
        }
        return false;
      },
    });
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access the library dashboard."
    >
      <AuthCard title="Sign in">
        <Form pending={pending} onSubmit={onSubmit}>
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
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="login-password"
            required
            disabled={pending}
            error={fieldErrors.password}
          >
            <PasswordField
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Signing in…">
            Secure access →
          </Button>
        </Form>
        <AuthFormFooter>
          <Link className="auth-footer-primary" href={ROUTES.forgotPassword}>
            Forgot password?
          </Link>
          <span className="auth-footer-secondary">
            No account? <Link href={ROUTES.register}>Register</Link>
          </span>
        </AuthFormFooter>
      </AuthCard>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageFallback title="Welcome back" />}>
      <LoginForm />
    </Suspense>
  );
}
