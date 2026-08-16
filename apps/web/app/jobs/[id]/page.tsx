'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { use, useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { JobStatusBadge } from '@/components/status-badges';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Field,
  Select,
  Skeleton,
  Textarea,
} from '@/components/ui';
import { applyToJob } from '@/lib/api/applications-api';
import {
  createBookmark,
  listBookmarks,
  removeBookmarkByJobId,
} from '@/lib/api/bookmarks-api';
import { getErrorMessage, getErrorStatus } from '@/lib/api/errors';
import { getPublicJob } from '@/lib/api/jobs-api';
import { listResumes } from '@/lib/api/resumes-api';
import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/lib/store';

type JobDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCandidate = user?.role === 'user';

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeMetaId, setResumeMetaId] = useState('');
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const jobQuery = useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => getPublicJob(id),
  });

  const resumesQuery = useQuery({
    queryKey: queryKeys.resumes,
    queryFn: listResumes,
    enabled: isCandidate,
  });

  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks,
    queryFn: listBookmarks,
    enabled: isCandidate,
  });

  const bookmarked = bookmarksQuery.data?.some((b) => b.jobId === id) ?? false;

  const applyMutation = useMutation({
    mutationFn: () =>
      applyToJob(id, {
        coverLetter,
        resumeMetaId: resumeMetaId || undefined,
      }),
    onSuccess: () => {
      setApplyMessage('Application submitted.');
      setApplyError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.myApplications });
    },
    onError: (error) => {
      setApplyMessage(null);
      setApplyError(getErrorMessage(error));
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (bookmarked) return removeBookmarkByJobId(id);
      return createBookmark(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks }),
  });

  function onApply(event: { preventDefault(): void }) {
    event.preventDefault();
    setApplyError(null);
    applyMutation.mutate();
  }

  if (jobQuery.isLoading) {
    return (
      <PageShell title="Job detail">
        <Skeleton className="h-48 w-full" />
      </PageShell>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <PageShell title="Job detail">
        <Alert tone="danger" title="Job not found">
          {getErrorMessage(jobQuery.error, 'This job may have been removed.')}
        </Alert>
      </PageShell>
    );
  }

  const job = jobQuery.data;

  return (
    <PageShell
      title={job.title}
      description={`${job.company?.name ?? 'Company'} · ${job.location}`}
      actions={
        <>
          <JobStatusBadge status={job.status} />
          {isCandidate ? (
            <Button
              size="sm"
              variant="secondary"
              loading={bookmarkMutation.isPending}
              onClick={() => bookmarkMutation.mutate()}
            >
              {bookmarked ? 'Remove bookmark' : 'Bookmark'}
            </Button>
          ) : null}
        </>
      }
    >
      <Card className="mb-6">
        <CardBody>
          <p className="whitespace-pre-wrap text-sm text-primary">{job.description}</p>
        </CardBody>
      </Card>

      {isCandidate && job.status === 'open' ? (
        <Card>
          <CardBody>
            <h2 className="text-md font-semibold text-primary">Apply</h2>
            <form className="mt-4 flex flex-col gap-4" onSubmit={onApply}>
              {applyError ? (
                <Alert
                  tone={
                    getErrorStatus(applyMutation.error) === 409 ? 'warning' : 'danger'
                  }
                  title="Application not submitted"
                >
                  {applyError}
                </Alert>
              ) : null}
              {applyMessage ? (
                <Alert tone="success" title="Success">
                  {applyMessage}
                </Alert>
              ) : null}
              <Field label="Cover letter" required hint="1–3000 characters">
                {({ id, describedBy, invalid }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    invalid={invalid}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    minLength={1}
                    maxLength={3000}
                    required
                  />
                )}
              </Field>
              <Field
                label="Resume (optional)"
                hint="Pick a saved resume from /my/resumes"
              >
                {({ id }) => (
                  <Select
                    id={id}
                    value={resumeMetaId}
                    onChange={(e) => setResumeMetaId(e.target.value)}
                    options={[
                      { value: '', label: 'No saved resume' },
                      ...(resumesQuery.data ?? []).map((r) => ({
                        value: r.id,
                        label: r.label || r.url,
                      })),
                    ]}
                  />
                )}
              </Field>
              <Button type="submit" loading={applyMutation.isPending}>
                Submit application
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {isCandidate && job.status !== 'open' ? (
        <Alert tone="info" title="Not accepting applications">
          This job is closed.
        </Alert>
      ) : null}

      {!user ? (
        <Alert tone="info" title="Sign in to apply">
          Candidates can apply after signing in.
        </Alert>
      ) : null}
    </PageShell>
  );
}
