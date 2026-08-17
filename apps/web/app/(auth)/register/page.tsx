'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type SyntheticEvent } from 'react';
import {
  Alert,
  Button,
  Form,
  Spinner,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { AuthInputGroup } from '@/components/splitter/auth-input-group';
import { AuthLayout, GoogleContinueButton } from '@/components/splitter';
import { IconLock, IconMail, IconPerson } from '@/components/splitter/icons';
import { authApi } from '@/lib/api';
import { rememberReturnPath, safeReturnPath } from '@/lib/return-url';

function RegisterForm() {
  const searchParams = useSearchParams();
  const returnUrl = safeReturnPath(searchParams.get('returnUrl'));
  const invitedEmail = searchParams.get('email') ?? '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const loginHref =
    returnUrl !== '/groups'
      ? `/login?returnUrl=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(email)}`
      : '/login';

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      rememberReturnPath(returnUrl);
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
            email, then log in to join the group.
          </p>
        </Alert>
        <Link href={loginHref} className="mt-6 inline-block">
          <Button>Go to login</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        invitedEmail
          ? 'Create an account with the invited email to join the group'
          : 'Start splitting expenses in seconds'
      }
    >
      <Form pending={pending} onSubmit={onSubmit} className="splitter-auth-form">
        <AuthInputGroup label="Full name" htmlFor="register-name" icon={<IconPerson />}>
          <TextInput
            id="register-name"
            className="splitter-auth-input"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={pending}
            required
          />
        </AuthInputGroup>
        <AuthInputGroup
          label="Email address"
          htmlFor="register-email"
          icon={<IconMail />}
        >
          <TextInput
            id="register-email"
            type="email"
            className="splitter-auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={pending}
            required
          />
        </AuthInputGroup>
        <AuthInputGroup label="Password" htmlFor="register-password" icon={<IconLock />}>
          <TextInput
            id="register-password"
            type="password"
            className="splitter-auth-input"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
            required
          />
        </AuthInputGroup>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <Button
          type="submit"
          className="splitter-auth-submit w-full"
          loading={pending}
          loadingText="Creating…"
        >
          Sign up
        </Button>
      </Form>

      <div className="splitter-auth-divider" aria-hidden="true">
        or continue with
      </div>

      <GoogleContinueButton returnUrl={returnUrl} disabled={pending} />

      <p className="splitter-auth-switch">
        Already have an account?{' '}
        <Link href={loginHref} className="splitter-auth-link">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Spinner label="Loading" />}>
      <RegisterForm />
    </Suspense>
  );
}
