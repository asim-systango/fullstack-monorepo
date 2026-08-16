'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input } from '@/components/ui';
import { createStaff, type CreateStaffResult } from '@/lib/api/admin-api';
import { getErrorMessage } from '@/lib/api/errors';
import { FEATURES } from '@/lib/auth/session';

export default function AdminNewStaffPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateStaffResult | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createStaff({ email, name }),
    onSuccess: (result) => {
      setCreated(result);
      setFormError(null);
      setEmail('');
      setName('');
    },
    onError: (error) => {
      setCreated(null);
      setFormError(getErrorMessage(error));
    },
  });

  function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);
    setCreated(null);
    setCopied(false);
    mutation.mutate();
  }

  return (
    <PageShell
      title="Create staff account"
      description="POST /admin/staff — email + name only. One-time tempPassword is shown once."
    >
      {!FEATURES.adminStaffCreate ? (
        <Alert tone="warning" title="Backend endpoint pending" className="mb-4">
          POST /admin/staff is not in AdminController yet. Enable with
          NEXT_PUBLIC_ENABLE_ADMIN_STAFF_CREATE=true when it ships. The form is ready to
          call the contract below.
        </Alert>
      ) : null}

      <Card className="max-w-md">
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {formError ? (
              <Alert tone="danger" title="Could not create staff">
                {formError}
              </Alert>
            ) : null}
            <Field label="Name" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}
            </Field>
            <Button type="submit" loading={mutation.isPending}>
              Create staff
            </Button>
          </form>

          {created ? (
            <Alert
              tone="success"
              title="Staff created — copy password now"
              className="mt-4"
            >
              <p className="text-sm">
                {created.name} ({created.email}) · role {created.role}
              </p>
              <p className="mt-2 font-mono text-sm">{created.tempPassword}</p>
              <p className="mt-2 text-sm">This password will not be shown again.</p>
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(created.tempPassword);
                  setCopied(true);
                }}
              >
                {copied ? 'Copied' : 'Copy temp password'}
              </Button>
            </Alert>
          ) : null}
        </CardBody>
      </Card>
    </PageShell>
  );
}
