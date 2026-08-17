'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Form,
  PasswordInput,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';
import { getHomeHref } from '@/lib/role-home';
import { getEmailError, getPasswordError, isValidEmail } from '@/lib/validation';
import { BicepsFlexed } from 'lucide-react';

const isProd = process.env.NODE_ENV === 'production';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const { refresh } = useAuth();
  const [email, setEmail] = useState(isProd ? '' : 'user@demo.local');
  const [password, setPassword] = useState(isProd ? '' : 'password123');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function validate(): boolean {
    const nextEmailError = getEmailError(email);
    const nextPasswordError = getPasswordError(password, 1);

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextEmailError && !nextPasswordError;
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setFormError(null);
    if (!validate()) return;

    setPending(true);
    try {
      const loggedInUser = await authApi.login({ email, password });
      await refresh();
      const isSafeNext =
        Boolean(next) && next!.startsWith('/') && !next!.startsWith('//');
      router.push(isSafeNext ? next! : getHomeHref(loggedInUser.role));
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Login failed');
      setPending(false);
    }
  }

  return (
    <div className="ui-auth-screen">
      <p className="ui-auth-brand flex items-center gap-1">
        <BicepsFlexed className="text-black" size={30} /> Fitness
      </p>
      <Card className="ui-auth-card">
        <CardHeader className="text-center">
          <CardTitle className="text-xl ">Welcome</CardTitle>
          <CardDescription className="text-base mb-4">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <Form pending={pending} onSubmit={onSubmit} noValidate>
          <Field
            label="Email"
            htmlFor="login-email"
            required
            error={emailError ?? undefined}
            disabled={pending}
            className="mb-6"
          >
            <TextInput
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email.trim()) {
                  setEmailError(
                    isValidEmail(email) ? null : 'Enter a valid email address',
                  );
                }
              }}
              autoComplete="email"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="login-password"
            required
            error={passwordError ?? undefined}
            disabled={pending}
            className="mb-8"
          >
            <PasswordInput
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}
          <Button
            type="submit"
            loading={pending}
            loadingText="Signing in…"
            className="w-full"
          >
            Login
          </Button>
        </Form>
      </Card>
      <p className="ui-auth-footer">
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}
