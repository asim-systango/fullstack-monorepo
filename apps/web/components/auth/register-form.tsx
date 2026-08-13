'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { useRegister } from '@/hooks/use-auth';
import { useAuthModal } from './auth-modal-context';
import { AuthFooterLink, AuthLegalText } from './auth-modal';

const REMEMBER_EMAIL_KEY = 'wordnest_remember_email';

function getFieldError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 409) {
      return 'An account with this email already exists. Sign in instead.';
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function RegisterForm() {
  const router = useRouter();
  const { returnTo, closeAuth, switchAuth } = useAuthModal();
  const registerMutation = useRegister();

  const [name, setName] = useState('');
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
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      closeAuth();
      router.push(returnTo);
    } catch (error) {
      setFormError(getFieldError(error));
    }
  }

  return (
    <>
      <h1
        id="auth-modal-title"
        className="font-display text-[2rem] leading-tight font-bold tracking-tight text-foreground"
      >
        Join Wordnest.
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={registerMutation.isPending}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={registerMutation.isPending}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={registerMutation.isPending}
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
          loading={registerMutation.isPending}
          loadingText="Creating account…"
        >
          Sign up
        </Button>
      </form>

      <AuthLegalText />

      <AuthFooterLink
        prompt="Already have an account?"
        linkText="Sign in"
        onClick={() => switchAuth('login')}
      />
    </>
  );
}
