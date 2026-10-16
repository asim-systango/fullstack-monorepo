'use client';

import { useState, type SyntheticEvent } from 'react';
import { Alert, Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import { useAuthForm } from '@/components/auth';
import { useCreateMember } from '@/lib/bookly';
import { createMemberSchema } from '@/lib/validation/auth';

export function AdminCreateMemberForm() {
  const createMember = useCreateMember();
  const { pending, error, fieldErrors, submit } = useAuthForm();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);
    await submit({
      schema: createMemberSchema,
      values: { name, email },
      onValid: async (values) => {
        await createMember.mutateAsync(values);
        setName('');
        setEmail('');
        setSuccess(
          'Member created. A welcome email with a temporary password was sent.',
        );
      },
    });
  }

  return (
    <section className="admin-panel admin-card">
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h2 className="admin-section-title">Create member</h2>
        <p className="admin-section-desc">
          Creates a library member account. BOOKLY emails a temporary password — it is
          never shown here.
        </p>
      </div>
      <div className="admin-panel-body">
        <Form pending={pending} onSubmit={onSubmit} className="max-w-lg">
          <Field
            label="Name"
            htmlFor="create-member-name"
            required
            disabled={pending}
            error={fieldErrors.name}
          >
            <TextInput
              id="create-member-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={pending}
            />
          </Field>
          <Field
            label="Email"
            htmlFor="create-member-email"
            required
            disabled={pending}
            error={fieldErrors.email}
          >
            <TextInput
              id="create-member-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={pending}
            />
          </Field>
          {error ? (
            <Alert tone="danger" title="Could not create member">
              {error}
            </Alert>
          ) : null}
          {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
          <Button type="submit" loading={pending} loadingText="Creating…">
            Create member
          </Button>
        </Form>
      </div>
    </section>
  );
}
