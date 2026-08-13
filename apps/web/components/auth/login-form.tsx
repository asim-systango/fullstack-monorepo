'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { useLogin, useMe } from '@/hooks/use-auth';
import { resolvePostAuthRedirect } from '@/lib/auth/roles';
import { useAuthModal } from './auth-modal-context';
import { AuthFooterLink } from './auth-modal';

const REMEMBER_EMAIL_KEY = 'wordnest_remember_email';

function getFieldError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 401) {
      return 'Invalid email or password.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function LoginForm() {
  const router = useRouter();
  const { returnTo, closeAuth, switchAuth } = useAuthModal();
  const { data: user } = useMe();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);

    try {
      const loggedInUser = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      closeAuth();
      router.push(resolvePostAuthRedirect(loggedInUser, returnTo));
    } catch (error) {
      setFormError(getFieldError(error));
    }
  }

  if (user) {
    return (
      <>
        <h1
          id="auth-modal-title"
          className="font-display text-[2rem] leading-tight font-bold tracking-tight text-foreground"
        >
          Sign in to Wordnest.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          You&apos;re already signed in as{' '}
          <span className="text-foreground">{user.email}</span>.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="h-12 w-full"
            onClick={() => {
              closeAuth();
              router.push(resolvePostAuthRedirect(user, returnTo));
            }}
          >
            Continue
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1
        id="auth-modal-title"
        className="font-display text-[2rem] leading-tight font-bold tracking-tight text-foreground"
      >
        Sign in to Wordnest.
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loginMutation.isPending}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loginMutation.isPending}
        />

        <label className="flex items-center gap-2.5 pt-1 text-sm text-foreground">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded border-border accent-foreground"
          />
          Remember me for faster sign in
        </label>

        {formError ? (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="mt-2 h-12 w-full rounded-pill border-border-strong text-base font-normal"
          loading={loginMutation.isPending}
          loadingText="Signing in…"
        >
          Sign in
        </Button>
      </form>

      <AuthFooterLink
        prompt="No account?"
        linkText="Create one"
        onClick={() => switchAuth('register')}
      />
    </>
  );
}
