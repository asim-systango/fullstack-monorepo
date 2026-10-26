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
  TextInput,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { cn } from '@shared/ui';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { ResumePreview } from '@/components/resume-templates';
import type { ResumeViewModel } from '@/components/resume-templates';
import { resumesApi, templatesApi } from '@/lib/resumes-api';
import type { Template } from '@/lib/resume-types';

type TemplatePickerProps = {
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  'aria-describedby'?: string;
  templates: Template[];
  value: string;
  onChange: (templateId: string) => void;
};

function TemplatePicker({
  id,
  required,
  disabled,
  invalid,
  'aria-describedby': describedBy,
  templates,
  value,
  onChange,
}: Readonly<TemplatePickerProps>) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Template"
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {templates.map((template) => {
        const selected = value === template.id;
        return (
          <label
            key={template.id}
            className={cn(
              'cursor-pointer rounded-md border bg-card p-2',
              selected ? 'border-primary ring-2 ring-primary' : 'border-border',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input
              type="radio"
              name="resume-template"
              value={template.id}
              checked={selected}
              disabled={disabled}
              required={required}
              onChange={() => onChange(template.id)}
              className="sr-only"
            />
            <div className="pointer-events-none h-40 overflow-hidden rounded-sm bg-background">
              <div className="w-[285%] origin-top-left scale-[0.35]">
                <ResumePreview resume={{ ...SAMPLE_RESUME, templateKey: template.key }} />
              </div>
            </div>
            <span className="mt-2 block text-sm font-medium">{template.name}</span>
          </label>
        );
      })}
    </div>
  );
}

const SAMPLE_RESUME: ResumeViewModel = {
  title: 'Software engineer',
  fullName: 'Alex Rivera',
  email: 'alex@example.com',
  phone: '',
  location: '',
  summary: 'Product engineer who ships clear, readable resumes.',
  templateKey: 'classic',
  sections: [
    {
      id: 'sample-experience',
      type: 'experience',
      title: 'Experience',
      position: 0,
      items: [
        {
          id: 'sample-role',
          heading: 'Software engineer',
          subheading: 'Example Co',
          startDate: '2022',
          endDate: '2024',
          description: 'Built product features used by customers every day.',
          position: 0,
        },
      ],
    },
  ],
};

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
          : 'Request failed'}{' '}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void templatesQuery.refetch()}
        >
          Retry
        </Button>
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
          className="max-w-4xl space-y-4"
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
          <Field label="Template" required disabled={createMutation.isPending}>
            <TemplatePicker
              templates={activeTemplates}
              value={templateId}
              disabled={createMutation.isPending}
              onChange={setTemplateId}
            />
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
