'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Field,
  Input,
  Skeleton,
  Textarea,
} from '@/components/ui';
import { getErrorMessage } from '@/lib/api/errors';
import { listCompanyJobs, updateJob } from '@/lib/api/jobs-api';
import { queryKeys } from '@/lib/query/keys';

type EditJobPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default function EditCompanyJobPage({ params }: EditJobPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const jobsQuery = useQuery({
    queryKey: queryKeys.companyJobs,
    queryFn: listCompanyJobs,
  });

  useEffect(() => {
    const job = jobsQuery.data?.find((j) => j.id === id);
    if (job && !hydrated) {
      setTitle(job.title);
      setLocation(job.location);
      setDescription(job.description);
      setHydrated(true);
    }
  }, [jobsQuery.data, id, hydrated]);

  const mutation = useMutation({
    mutationFn: () => updateJob(id, { title, location, description }),
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

  if (jobsQuery.isLoading) {
    return (
      <PageShell title="Edit job">
        <Skeleton className="h-48 w-full" />
      </PageShell>
    );
  }

  if (jobsQuery.isSuccess && !jobsQuery.data.find((j) => j.id === id)) {
    return (
      <PageShell title="Edit job">
        <Alert tone="danger" title="Job not found">
          This job is not in your company list.
        </Alert>
      </PageShell>
    );
  }

  return (
    <PageShell title="Edit job" description="PATCH /jobs/:id">
      <Card className="max-w-xl">
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {formError ? (
              <Alert tone="danger" title="Could not update job">
                {formError}
              </Alert>
            ) : null}
            <Field label="Title" required>
              {({ id: fieldId, describedBy, invalid }) => (
                <Input
                  id={fieldId}
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
              {({ id: fieldId, describedBy, invalid }) => (
                <Input
                  id={fieldId}
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
              {({ id: fieldId, describedBy, invalid }) => (
                <Textarea
                  id={fieldId}
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
              Save changes
            </Button>
          </form>
        </CardBody>
      </Card>
    </PageShell>
  );
}
