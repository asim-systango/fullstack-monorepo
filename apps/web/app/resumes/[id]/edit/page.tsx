'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  LoadingState,
  Page,
  PageHeader,
  StatusMessage,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { ResumeEditorForm } from '@/components/resumes/resume-editor-form';
import { ResumePreview } from '@/components/resume-templates';
import { draftToUpdateInput } from '@/lib/resume-types';
import { resumesApi, templatesApi } from '@/lib/resumes-api';
import {
  clearResumeDraft,
  loadFromServer,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function EditResumePage() {
  return (
    <Page className="max-w-6xl">
      <ShellHeader title="Edit resume" subtitle="Form + live preview" />
      <RequireAuth role="user">
        <EditResumeEditor />
      </RequireAuth>
    </Page>
  );
}

function EditResumeEditor() {
  const params = useParams();
  const id = String(params.id ?? '');
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.resumeDraft.draft);
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishDetails, setPublishDetails] = useState<
    Array<{ field: string; message: string }>
  >([]);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resumeQuery = useQuery({
    queryKey: ['resumes', id],
    queryFn: () => resumesApi.getOne(id),
    enabled: Boolean(id),
  });

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
  });

  useEffect(() => {
    if (resumeQuery.data) {
      dispatch(loadFromServer(resumeQuery.data));
    }
  }, [dispatch, resumeQuery.data]);

  useEffect(() => {
    return () => {
      dispatch(clearResumeDraft());
    };
  }, [dispatch]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error('No draft');
      return resumesApi.update(id, draftToUpdateInput(draft));
    },
    onMutate: () => {
      setSaveStatus('saving');
      setSaveError(null);
    },
    onSuccess: (resume) => {
      dispatch(loadFromServer(resume));
      setSaveStatus('saved');
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      void queryClient.setQueryData(['resumes', id], resume);
    },
    onError: (err) => {
      setSaveStatus('error');
      setSaveError(err instanceof ApiClientError ? err.message : 'Save failed');
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (draft) {
        await resumesApi.update(id, draftToUpdateInput(draft));
      }
      return resumesApi.publish(id);
    },
    onMutate: () => {
      setPublishDetails([]);
      setPublishMessage(null);
    },
    onSuccess: (resume) => {
      dispatch(loadFromServer(resume));
      setSaveStatus('saved');
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      void queryClient.setQueryData(['resumes', id], resume);
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        setPublishDetails(err.body.details ?? []);
        setPublishMessage(err.message);
      } else {
        setPublishMessage('Publish failed');
      }
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => resumesApi.unpublish(id),
    onSuccess: (resume) => {
      dispatch(loadFromServer(resume));
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      void queryClient.setQueryData(['resumes', id], resume);
    },
    onError: (err) => {
      setPublishMessage(err instanceof ApiClientError ? err.message : 'Unpublish failed');
    },
  });

  if (resumeQuery.isLoading || templatesQuery.isLoading) {
    return <LoadingState label="Loading editor…" />;
  }

  if (resumeQuery.isError) {
    return (
      <Alert tone="danger" title="Resume not found">
        {resumeQuery.error instanceof ApiClientError
          ? resumeQuery.error.message
          : 'Could not load this resume'}
      </Alert>
    );
  }

  if (!draft) {
    return <LoadingState label="Preparing draft…" />;
  }

  const publicPath = draft.slug ? `/r/${draft.slug}` : null;

  return (
    <>
      <PageHeader
        title={draft.title || 'Untitled resume'}
        description="Edits update the preview immediately. Save to persist."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Badge tone={draft.status === 'published' ? 'success' : 'neutral'}>
              {draft.status}
            </Badge>
            <Link href="/resumes" className="text-sm">
              Back
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <Button
          type="button"
          loading={saveMutation.isPending}
          loadingText="Saving…"
          onClick={() => saveMutation.mutate()}
        >
          Save
        </Button>
        {draft.status === 'published' ? (
          <Button
            type="button"
            variant="secondary"
            loading={unpublishMutation.isPending}
            loadingText="Unpublishing…"
            onClick={() => unpublishMutation.mutate()}
          >
            Unpublish
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            loading={publishMutation.isPending}
            loadingText="Publishing…"
            onClick={() => publishMutation.mutate()}
          >
            Publish
          </Button>
        )}
        {saveStatus === 'saving' ? (
          <StatusMessage tone="neutral">Saving…</StatusMessage>
        ) : null}
        {saveStatus === 'saved' ? (
          <StatusMessage tone="success">Saved</StatusMessage>
        ) : null}
        {saveStatus === 'error' && saveError ? (
          <StatusMessage tone="error">{saveError}</StatusMessage>
        ) : null}
      </div>

      {publishDetails.length > 0 || publishMessage ? (
        <Alert tone="danger" title="Cannot publish" className="mb-4 print:hidden">
          {publishDetails.length > 0 ? (
            <ul className="list-disc pl-5">
              {publishDetails.map((d) => (
                <li key={`${d.field}-${d.message}`}>{d.message}</li>
              ))}
            </ul>
          ) : (
            publishMessage
          )}
        </Alert>
      ) : null}

      {publicPath ? (
        <Alert tone="success" title="Public link" className="mb-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={publicPath}>{publicPath}</Link>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={async () => {
                const url = `${window.location.origin}${publicPath}`;
                await navigator.clipboard.writeText(url);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 flex-1 print:hidden">
          <ResumeEditorForm templates={templatesQuery.data ?? []} />
        </div>
        <div className="min-w-0 flex-1 md:sticky md:top-4 md:self-start">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground print:hidden">
            Preview
          </h2>
          <ResumePreview resume={draft} />
        </div>
      </div>
    </>
  );
}
