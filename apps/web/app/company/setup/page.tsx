'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input, Textarea } from '@/components/ui';
import { createCompany, getMyCompany } from '@/lib/api/companies-api';
import { getErrorMessage, getErrorStatus } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';

export default function CompanySetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: queryKeys.companyMe,
    queryFn: getMyCompany,
    retry: false,
  });

  useEffect(() => {
    if (existing.isSuccess) router.replace('/dashboard');
  }, [existing.isSuccess, router]);

  const mutation = useMutation({
    mutationFn: () =>
      createCompany({
        name,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companyMe });
      router.replace('/dashboard');
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
      title="Set up your company"
      description="One-time POST /companies. There is no PATCH /companies yet — profile edits are not available in the UI."
    >
      {existing.isError && getErrorStatus(existing.error) !== 404 ? (
        <Alert tone="danger" className="mb-4">
          {getErrorMessage(existing.error)}
        </Alert>
      ) : null}
      <Card className="max-w-lg">
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {formError ? (
              <Alert tone="danger" title="Could not create company">
                {formError}
              </Alert>
            ) : null}
            <Field label="Company name" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={1}
                  maxLength={150}
                  required
                />
              )}
            </Field>
            <Field label="Website" hint="Optional URL">
              {({ id }) => (
                <Input
                  id={id}
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              )}
            </Field>
            <Field label="Description" hint="Optional, max 2000 chars">
              {({ id }) => (
                <Textarea
                  id={id}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                />
              )}
            </Field>
            <Button type="submit" loading={mutation.isPending}>
              Create company
            </Button>
          </form>
        </CardBody>
      </Card>
    </PageShell>
  );
}
