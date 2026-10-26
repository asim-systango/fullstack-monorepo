'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Alert, LoadingState, Page } from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ResumePreview } from '@/components/resume-templates';
import { resumeToDraft } from '@/lib/resume-types';
import { resumesApi } from '@/lib/resumes-api';

export default function PublicResumePage() {
  const params = useParams();
  const slug = String(params.slug ?? '');

  const query = useQuery({
    queryKey: ['public-resume', slug],
    queryFn: () => resumesApi.getPublic(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <Page className="max-w-3xl">
        <LoadingState label="Loading resume…" />
      </Page>
    );
  }

  if (query.isError || !query.data) {
    const message =
      query.error instanceof ApiClientError
        ? query.error.message
        : 'This resume is not available';
    return (
      <Page className="max-w-3xl">
        <Alert tone="danger" title="This resume is not available">
          {message === 'This resume is not available'
            ? 'It may be unpublished, deleted, or the link is incorrect.'
            : message}
        </Alert>
      </Page>
    );
  }

  const draft = resumeToDraft(query.data);

  return (
    <Page className="max-w-3xl print:max-w-none">
      <ResumePreview resume={draft} />
    </Page>
  );
}
