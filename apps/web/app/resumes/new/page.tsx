'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Field,
  Form,
  LoadingState,
  Page,
  PageHeader,
  Select,
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { resumesApi, templatesApi } from '@/lib/resumes-api';

export default function NewResumePage() {
  return (
    <Page>
      <ShellHeader title="New resume" subtitle="Title and template" />
      <RequireAuth role="user">
        <NewResumeForm />
      </RequireAuth>
    </Page>
  );
}

function NewResumeForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
  });

  const activeTemplates = (templatesQuery.data ?? []).filter((t) => t.isActive);

  const createMutation = useMutation({
    mutationFn: () => resumesApi.create({ title: title.trim(), templateId }),
    onSuccess: (resume) => {
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      router.push(`/resumes/${resume.id}/edit`);
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Create failed');
    },
  });

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !templateId) {
      setError('Title and template are required');
      return;
    }
    createMutation.mutate();
  }

  if (templatesQuery.isLoading) {
    return <LoadingState label="Loading templates…" />;
  }

  if (templatesQuery.isError) {
    return (
      <Alert tone="danger" title="Could not load templates">
        {templatesQuery.error instanceof ApiClientError
          ? templatesQuery.error.message
          : 'Request failed'}
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title="Create resume"
        description="Pick an active template. You can switch designs later in the editor."
        actions={
          <Link href="/resumes" className="text-sm">
            Back to list
          </Link>
        }
      />

      {activeTemplates.length === 0 ? (
        <Alert tone="danger" title="No active templates">
          Ask an admin to enable at least one template.
        </Alert>
      ) : (
        <Form
          pending={createMutation.isPending}
          onSubmit={onSubmit}
          className="max-w-md space-y-4"
        >
          <Field
            label="Title"
            htmlFor="new-title"
            required
            disabled={createMutation.isPending}
          >
            <TextInput
              id="new-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Software engineer resume"
            />
          </Field>
          <Field
            label="Template"
            htmlFor="new-template"
            required
            disabled={createMutation.isPending}
          >
            <Select
              id="new-template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a template
              </option>
              {activeTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.key})
                </option>
              ))}
            </Select>
          </Field>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          <Button
            type="submit"
            loading={createMutation.isPending}
            loadingText="Creating…"
          >
            Create
          </Button>
        </Form>
      )}
    </>
  );
}
