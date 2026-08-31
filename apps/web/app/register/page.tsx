'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input } from '@/components/ui';
import { register } from '@/lib/api/auth-api';
import { getErrorMessage } from '@/lib/api/errors';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => register({ name, email, password }),
    onSuccess: () => router.push('/login?registered=1'),
    onError: (error) => setFormError(getErrorMessage(error, 'Could not create account')),
  });

  function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);
    mutation.mutate();
  }

  return (
    <PageShell
      title="Join as a candidate"
      description="Self-registration creates a user (candidate) account. Company staff are provisioned by admins."
    >
      <Card className="max-w-md">
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {formError ? (
              <Alert tone="danger" title="Registration failed">
                {formError}
              </Alert>
            ) : null}
            <Field label="Full name" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={1}
                  maxLength={120}
                  required
                />
              )}
            </Field>
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
            <Field label="Password" required hint="8–128 characters">
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                />
              )}
            </Field>
            <Button type="submit" fullWidth loading={mutation.isPending}>
              Create account
            </Button>
          </form>
          <p className="mt-4 text-sm text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </PageShell>
  );
}
