'use client';

import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import { useAuth, useAuthForm } from '@/components/auth';
import { MemberContent, MemberPageHeader, RequireMember } from '@/components/member';
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
    <MemberContent className="space-y-6">
      <MemberPageHeader
        title="Profile"
        description="Your Bookly account details. Name and email can be updated below."
      />

      <section className="member-card member-enter p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
          Account
        </p>
        <dl className="mt-3 mb-0 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[color:var(--bookly-muted)]">Name</dt>
            <dd className="m-0 font-medium text-[color:var(--bookly-navy)]">
              {user?.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[color:var(--bookly-muted)]">Email</dt>
            <dd className="m-0 font-medium text-[color:var(--bookly-navy)]">
              {user?.email ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[color:var(--bookly-muted)]">Role</dt>
            <dd className="m-0 font-medium text-[color:var(--bookly-navy)]">Member</dd>
          </div>
        </dl>
      </section>

      <Form
        pending={pending}
        onSubmit={onSubmit}
        className="member-card member-enter max-w-xl p-5"
        style={{ '--member-stagger': 1 } as CSSProperties}
      >
        <h2 className="m-0 text-lg font-semibold text-[color:var(--bookly-navy)]">
          Edit details
        </h2>
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
        <Link href={ROUTES.changePassword} className="member-inline-link">
          Change password
        </Link>
      </p>
    </MemberContent>
  );
}

export default function ProfilePage() {
  return (
    <RequireMember>
      <ProfileContent />
    </RequireMember>
  );
}
