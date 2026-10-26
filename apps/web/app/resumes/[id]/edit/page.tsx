'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
import { draftToUpdateInput, resumeToDraft, type ResumeDraft } from '@/lib/resume-types';
import { resumesApi, templatesApi } from '@/lib/resumes-api';
import {
  clearResumeDraft,
  loadFromServer,
  updateFields,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Only the editor instance that is still on screen may clear the shared draft. */
let activeEditorMount = 0;

function toSnapshot(draft: ResumeDraft): string {
  return JSON.stringify(draftToUpdateInput(draft));
}

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
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const inFlightSnapshot = useRef<string | null>(null);
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
    if (!resumeQuery.data || resumeQuery.data.id !== id) return;
    if (draft?.id === id) return;
    dispatch(loadFromServer(resumeQuery.data));
    setSavedSnapshot(toSnapshot(resumeToDraft(resumeQuery.data)));
  }, [dispatch, draft, id, resumeQuery.data]);

  useEffect(() => {
    const token = ++activeEditorMount;
    return () => {
      if (activeEditorMount === token) {
        dispatch(clearResumeDraft());
      }
    };
  }, [dispatch]);

  const isDirty =
    draft !== null && savedSnapshot !== null && toSnapshot(draft) !== savedSnapshot;

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const saveMutation = useMutation({
    mutationFn: (sent: ResumeDraft) => resumesApi.update(id, draftToUpdateInput(sent)),
    onMutate: (sent) => {
      inFlightSnapshot.current = toSnapshot(sent);
      setSaveStatus('saving');
      setSaveError(null);
    },
    onSettled: () => {
      inFlightSnapshot.current = null;
    },
    onSuccess: (resume, sent) => {
      setSavedSnapshot(toSnapshot(sent));
      dispatch(updateFields({ status: resume.status, slug: resume.slug }));
      setSaveStatus('saved');
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.setQueryData(['resumes', id], resume);
    },
    onError: (err) => {
      setSaveStatus('error');
      setSaveError(err instanceof ApiClientError ? err.message : 'Save failed');
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (sent: ResumeDraft) => {
      await resumesApi.update(id, draftToUpdateInput(sent));
      return resumesApi.publish(id);
    },
    onMutate: () => {
      setPublishDetails([]);
      setPublishMessage(null);
    },
    onSuccess: (resume, sent) => {
      setSavedSnapshot(toSnapshot(sent));
      dispatch(updateFields({ status: resume.status, slug: resume.slug }));
      setSaveStatus('saved');
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.setQueryData(['resumes', id], resume);
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
      dispatch(updateFields({ status: resume.status, slug: resume.slug }));
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.setQueryData(['resumes', id], resume);
    },
    onError: (err) => {
      setPublishMessage(err instanceof ApiClientError ? err.message : 'Unpublish failed');
    },
  });

  if (resumeQuery.isLoading || templatesQuery.isLoading) {
    return <LoadingState label="Loading editor…" />;
  }

  if (resumeQuery.isError || templatesQuery.isError) {
    const err = resumeQuery.error ?? templatesQuery.error;
    if (err instanceof ApiClientError && err.statusCode === 404) {
      return (
        <Alert tone="danger" title="Resume not found">
          It may have been deleted, or it isn&apos;t yours.
        </Alert>
      );
    }
    return (
      <Alert tone="danger" title="Could not load the editor">
        {err instanceof ApiClientError ? err.message : 'Something went wrong.'}{' '}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            void resumeQuery.refetch();
            void templatesQuery.refetch();
          }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  if (!draft || draft.id !== id) {
    return <LoadingState label="Preparing draft…" />;
  }

  const publicPath = draft.slug ? `/r/${draft.slug}` : null;
  const typedDuringSave =
    saveStatus === 'saving' &&
    inFlightSnapshot.current !== null &&
    toSnapshot(draft) !== inFlightSnapshot.current;
  const showUnsaved = (isDirty && saveStatus !== 'saving') || typedDuringSave;

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
          onClick={() => draft && saveMutation.mutate(draft)}
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
            onClick={() => draft && publishMutation.mutate(draft)}
          >
            Publish
          </Button>
        )}
        {saveStatus === 'saving' ? (
          <StatusMessage tone="neutral">Saving…</StatusMessage>
        ) : null}
        {showUnsaved ? (
          <StatusMessage tone="neutral">Unsaved changes</StatusMessage>
        ) : null}
        {!isDirty && saveStatus === 'saved' ? (
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
