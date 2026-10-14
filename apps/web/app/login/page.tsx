'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input } from '@/components/ui';
import { login } from '@/lib/api/auth-api';
import { getErrorMessage } from '@/lib/api/errors';
import { homePathForRole, requiresPasswordChange, type MeUser } from '@/lib/auth/session';
import { useAuthStore } from '@/lib/store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: async () => {
      const me = (await hydrateFromMe()) as MeUser | null;
      if (!me) {
        setFormError('Signed in, but could not load your profile.');
        return;
      }
      setUser(me);
      if (requiresPasswordChange(me)) {
        router.replace('/change-password');
        return;
      }
      const next = searchParams.get('next');
      router.replace(next && next.startsWith('/') ? next : homePathForRole(me.role));
    },
    onError: (error) => setFormError(getErrorMessage(error, 'Invalid email or password')),
  });

  function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);
    mutation.mutate();
  }

  return (
    <PageShell
      title="Sign in"
      description="One login for candidates, company staff, and admins."
    >
      <Card className="max-w-md">
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {formError ? (
              <Alert tone="danger" title="Could not sign in">
                {formError}
              </Alert>
            ) : null}
            <Field label="Email" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}
            </Field>
            <Field label="Password" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}
            </Field>
            <Button type="submit" fullWidth loading={mutation.isPending}>
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-sm text-secondary">
            New candidate?{' '}
            <Link href="/register" className="font-medium text-brand">
              Create an account
            </Link>
          </p>
        </CardBody>
      </Card>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageShell title="Sign in" />}>
      <LoginForm />
    </Suspense>
  );
}
