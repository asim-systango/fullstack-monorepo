'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { AuthLayout } from '@/components/splitter';
import {
  IconApple,
  IconEye,
  IconEyeOff,
  IconGoogle,
  IconLock,
  IconMail,
} from '@/components/splitter/icons';
import { useAuth } from '@/components/auth';
import { authApi } from '@/lib/api';
import { peekRememberedReturnPath, safeReturnPath } from '@/lib/return-url';

const isProd = process.env.NODE_ENV === 'production';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryReturn = safeReturnPath(searchParams.get('returnUrl'));
  const returnUrl = searchParams.get('returnUrl')
    ? queryReturn
    : (peekRememberedReturnPath() ?? '/groups');
  const invitedEmail = searchParams.get('email');
  const { refresh } = useAuth();
  const [email, setEmail] = useState(invitedEmail || (isProd ? '' : 'staff@demo.local'));
  const [password, setPassword] = useState(isProd ? '' : 'password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setUnverifiedEmail(null);
    setResendMsg(null);
    try {
      await authApi.login({ email, password });
      await refresh();
      router.push(returnUrl);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 403) {
        setUnverifiedEmail(email);
        setError('Please verify your email before signing in.');
      } else {
        setError(err instanceof ApiClientError ? err.message : 'Login failed');
      }
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    if (!unverifiedEmail) return;
    setResendMsg(null);
    try {
      const res = await authApi.resendVerification({ email: unverifiedEmail });
      setResendMsg(res.message);
    } catch {
      setResendMsg(
        'If that email is registered and unverified, we sent a verification link.',
      );
    }
  }

  const registerHref =
    returnUrl !== '/groups'
      ? `/register?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/register';

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Sign in to continue to your account">
      <Form pending={pending} onSubmit={onSubmit} className="splitter-auth-form">
        <AuthInputGroup label="Email address" htmlFor="login-email" icon={<IconMail />}>
          <TextInput
            id="login-email"
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

        <AuthInputGroup
          label="Password"
          htmlFor="login-password"
          icon={<IconLock />}
          trailing={
            <button
              type="button"
              className="splitter-auth-password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          }
        >
          <TextInput
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className="splitter-auth-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={pending}
            required
          />
        </AuthInputGroup>

        <div className="splitter-auth-forgot-row">
          <Link href="/forgot-password" className="splitter-auth-link">
            Forgot password?
          </Link>
        </div>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {unverifiedEmail ? (
          <Alert tone="info">
            <p className="text-sm">Check your inbox for a verification link, or</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1"
              onClick={() => void resend()}
            >
              resend verification email
            </Button>
            {resendMsg ? <p className="mt-2 text-xs">{resendMsg}</p> : null}
          </Alert>
        ) : null}

        <Button
          type="submit"
          className="splitter-auth-submit w-full"
          loading={pending}
          loadingText="Signing in…"
        >
          Log in
        </Button>
      </Form>

      <div className="splitter-auth-divider" aria-hidden="true">
        or continue with
      </div>

      <div className="splitter-auth-social">
        <button
          type="button"
          className="splitter-auth-social-btn"
          disabled
          title="Coming soon"
        >
          <span className="splitter-auth-social-icon">
            <IconGoogle />
          </span>
          <span className="splitter-auth-social-label">Continue with Google</span>
        </button>
        <button
          type="button"
          className="splitter-auth-social-btn"
          disabled
          title="Coming soon"
        >
          <span className="splitter-auth-social-icon">
            <IconApple />
          </span>
          <span className="splitter-auth-social-label">Continue with Apple</span>
        </button>
      </div>

      <p className="splitter-auth-switch">
        New to Splitter?{' '}
        <Link href={registerHref} className="splitter-auth-link">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner label="Loading" />}>
      <LoginForm />
    </Suspense>
  );
}
