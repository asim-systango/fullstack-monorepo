'use client';

import { useState, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Form,
  PageHeader,
  TextArea,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageFetchSkeleton } from '@/components/content-skeletons';
import { IssueStatusBadge } from '@/components/issue-status-badge';
import { issuesApi } from '@/lib/domain-api';
import { ALLOWED_TRANSITIONS, STATUS_LABEL } from '@/lib/status';
import type { IssueStatus } from '@/lib/domain-types';
import { ApiClientError } from '@shared/api-client';
import { useIssueSocket } from '@/hooks/use-issue-socket';

function IssueDetailContent() {
  const params = useParams<{ id: string }>();
  const issueId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pulsed, setPulsed] = useState(false);
  const issueQuery = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => issuesApi.get(issueId),
    enabled: Boolean(issueId),
  });
  useIssueSocket(true, issueQuery.data?.projectId);

  const statusMutation = useMutation({
    mutationFn: (status: IssueStatus) => issuesApi.updateStatus(issueId, status),
    onSuccess: async () => {
      setError(null);
      setPulsed(true);
      await queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      window.setTimeout(() => setPulsed(false), 700);
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiClientError ? err.message : 'Status update failed');
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => issuesApi.addComment(issueId, comment),
    onSuccess: async () => {
      setComment('');
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiClientError ? err.message : 'Comment failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => issuesApi.softDelete(issueId),
    onSuccess: async () => {
      const projectId = issueQuery.data?.projectId;
      setConfirmDelete(false);
      await queryClient.invalidateQueries({ queryKey: ['project-issues'] });
      if (projectId) {
        router.push(`/projects/${projectId}/issues`);
      } else {
        router.push('/projects');
      }
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed');
    },
  });

  if (issueQuery.isLoading) {
    return (
      <>
        <PageHeader title="Issue" description="Loading…" />
        <PageFetchSkeleton label="Loading issue…" />
      </>
    );
  }

  if (issueQuery.isError) {
    return (
      <Alert tone="danger" title="Issue unavailable">
        {(issueQuery.error as Error).message || 'This issue is no longer available.'}
        <div className="mt-2">
          <Link href="/projects">Back to projects</Link>
        </div>
      </Alert>
    );
  }

  const issue = issueQuery.data!;

  function onComment(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    commentMutation.mutate();
  }

  return (
    <>
      <PageHeader
        title={issue.title}
        description="Details, comments, and activity"
        actions={<Link href={`/projects/${issue.projectId}/board`}>← Board</Link>}
      />

      {error ? (
        <Alert tone="danger" className="mb-3">
          {error}
        </Alert>
      ) : null}

      <div className="tf-enter mb-4 flex flex-wrap items-center gap-2">
        <IssueStatusBadge status={issue.status} pulse={pulsed} />
        {issue.labels.map((l) => (
          <Badge key={l.id}>{l.name}</Badge>
        ))}
        {ALLOWED_TRANSITIONS[issue.status].map((next) => (
          <Button
            key={next}
            size="sm"
            variant="secondary"
            loading={statusMutation.isPending}
            onClick={() => statusMutation.mutate(next)}
          >
            Move to {STATUS_LABEL[next]}
          </Button>
        ))}
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      </div>

      <Card className="tf-enter tf-panel mb-4">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {issue.description || 'No description.'}
          </p>
        </CardBody>
      </Card>

      <Card className="tf-enter tf-panel mb-4">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {(issue.comments ?? []).length === 0 ? (
            <EmptyState title="No comments yet" description="Start the thread below." />
          ) : (
            <ul className="space-y-3">
              {(issue.comments ?? []).map((c) => (
                <li key={c.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="whitespace-pre-wrap">{c.body}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {c.authorUserId.slice(0, 8)}… ·{' '}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Form
            onSubmit={onComment}
            className="sticky bottom-2 space-y-2 rounded-md border border-border bg-background/95 p-3 backdrop-blur"
          >
            <Field label="Add comment" htmlFor="comment-body">
              <TextArea
                id="comment-body"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                required
              />
            </Field>
            <Button type="submit" loading={commentMutation.isPending}>
              Comment
            </Button>
          </Form>
        </CardBody>
      </Card>

      <Card className="tf-enter tf-panel">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardBody>
          {(issue.activity ?? []).length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Status changes will appear here."
            />
          ) : (
            <ul className="tf-timeline">
              {(issue.activity ?? []).map((a) => (
                <li key={a.id} className="tf-timeline-item text-sm">
                  <span className="text-foreground">{a.message}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this issue?"
        description="It will be soft-deleted and hidden from boards and lists."
        confirmLabel="Delete issue"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}

export default function IssueDetailPage() {
  return (
    <TaskFlowPage wide>
      <ShellHeader />
      <RequireAuth>
        <IssueDetailContent />
      </RequireAuth>
    </TaskFlowPage>
  );
}
