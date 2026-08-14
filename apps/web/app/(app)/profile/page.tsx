'use client';

import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import { useAuth, useAuthForm } from '@/components/auth';
import { RequireMember } from '@/components/member';
import { useUpdateMe } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email'),
});

function ProfileContent() {
  const { user } = useAuth();
  const updateMe = useUpdateMe();
  const { pending, error, fieldErrors, submit } = useAuthForm();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);
    const ok = await submit({
      schema: profileSchema,
      values: { name, email },
      onValid: async (values) => {
        await updateMe.mutateAsync({
          name: values.name,
          email: values.email,
        });
        setSuccess('Profile updated.');
      },
    });
    if (!ok) setSuccess(null);
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="member-enter">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-[color:var(--bookly-navy)]">
          Profile
        </h1>
        <p className="mt-2 mb-0 text-[color:var(--bookly-muted)]">
          Update the name and email on your Bookly account.
        </p>
      </header>

      <Form
        pending={pending}
        onSubmit={onSubmit}
        className="member-card member-enter space-y-4 p-5"
        style={{ '--member-stagger': 1 } as CSSProperties}
      >
        <Field
          label="Name"
          htmlFor="profile-name"
          required
          disabled={pending}
          error={fieldErrors.name}
        >
          <TextInput
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
            autoComplete="name"
          />
        </Field>
        <Field
          label="Email"
          htmlFor="profile-email"
          required
          disabled={pending}
          error={fieldErrors.email}
        >
          <TextInput
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            autoComplete="email"
          />
        </Field>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </Form>

      <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
        Need a new password?{' '}
        <Link
          href={ROUTES.changePassword}
          className="font-medium text-[color:var(--bookly-navy)]"
        >
          Change password
        </Link>
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireMember>
      <ProfileContent />
    </RequireMember>
  );
}
