'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input, Textarea } from '@/components/ui';
import { getErrorMessage } from '@/lib/api/errors';
import { createJob } from '@/lib/api/jobs-api';
import { queryKeys } from '@/lib/query/keys';

export default function NewCompanyJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createJob({ title, location, description }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companyJobs });
      router.push('/company/jobs');
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);
    mutation.mutate();
  }

  return (
    <PageShell
      title="New job"
      description="POST /jobs — title/location 1–150, description 1–5000."
    >
      <Card className="max-w-xl">
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {formError ? (
              <Alert tone="danger" title="Could not create job">
                {formError}
              </Alert>
            ) : null}
            <Field label="Title" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  required
                />
              )}
            </Field>
            <Field label="Location" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={150}
                  required
                />
              )}
            </Field>
            <Field label="Description" required>
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={5000}
                  required
                />
              )}
            </Field>
            <Button type="submit" loading={mutation.isPending}>
              Create job
            </Button>
          </form>
        </CardBody>
      </Card>
    </PageShell>
  );
}
