'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  PageHeader,
  Skeleton,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { IssueStatusBadge } from '@/components/issue-status-badge';
import { issuesApi } from '@/lib/domain-api';
import { ALLOWED_TRANSITIONS, STATUS_LABEL } from '@/lib/status';
import type { Issue, IssueStatus } from '@/lib/domain-types';
import { ApiClientError } from '@shared/api-client';
import { useIssueSocket } from '@/hooks/use-issue-socket';

const COLUMNS: IssueStatus[] = ['todo', 'in_progress', 'done'];

function columnBadgeTone(status: IssueStatus): 'neutral' | 'accent' | 'success' {
  if (status === 'done') return 'success';
  if (status === 'in_progress') return 'accent';
  return 'neutral';
}

function BoardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-hidden>
      {COLUMNS.map((c) => (
        <div key={c} className="space-y-3">
          <Skeleton size="line" className="w-1/2" />
          <Skeleton size="lg" className="h-24" />
          <Skeleton size="lg" className="h-24" />
        </div>
      ))}
    </div>
  );
}

function BoardIssueCard({
  issue,
  pendingId,
  pulsedId,
  onMove,
}: Readonly<{
  issue: Issue;
  pendingId: string | null;
  pulsedId: string | null;
  onMove: (id: string, status: IssueStatus) => void;
}>) {
  return (
    <div className="tf-board-card tf-card-lift">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link href={`/issues/${issue.id}`} className="font-medium leading-snug">
          {issue.title}
        </Link>
        <IssueStatusBadge status={issue.status} pulse={pulsedId === issue.id} />
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {issue.labels.map((l) => (
          <Badge key={l.id} tone="neutral">
            {l.name}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {ALLOWED_TRANSITIONS[issue.status].map((next) => (
          <Button
            key={next}
            size="sm"
            variant="secondary"
            loading={pendingId === issue.id}
            disabled={pendingId !== null && pendingId !== issue.id}
            onClick={() => onMove(issue.id, next)}
          >
            → {STATUS_LABEL[next]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function BoardContent() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pulsedId, setPulsedId] = useState<string | null>(null);
  useIssueSocket(true);

  const issuesQuery = useQuery({
    queryKey: ['project-issues', projectId, { board: true }],
    queryFn: () => issuesApi.list(projectId, { limit: 100 }),
    enabled: Boolean(projectId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IssueStatus }) =>
      issuesApi.updateStatus(id, status),
    onMutate: ({ id }) => setPendingId(id),
    onSuccess: async (_data, vars) => {
      setPulsedId(vars.id);
      await queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
      window.setTimeout(() => setPulsedId(null), 700);
    },
    onSettled: () => setPendingId(null),
  });

  const items = issuesQuery.data?.items ?? [];
  const byStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = items.filter((i) => i.status === status);
      return acc;
    },
    {} as Record<IssueStatus, Issue[]>,
  );

  return (
    <>
      <PageHeader
        title="Board"
        description="Issues grouped by status"
        actions={
          <>
            <Link href={`/projects/${projectId}`}>Overview</Link>
            <Link href={`/projects/${projectId}/issues`}>List</Link>
          </>
        }
      />

      {statusMutation.isError ? (
        <Alert tone="danger" className="mb-3">
          {statusMutation.error instanceof ApiClientError
            ? statusMutation.error.message
            : 'Status update failed'}
        </Alert>
      ) : null}

      {issuesQuery.isLoading ? <BoardSkeleton /> : null}

      {issuesQuery.isError ? (
        <Alert tone="danger">
          {(issuesQuery.error as Error).message}
          <Button
            size="sm"
            variant="secondary"
            className="ml-2"
            onClick={() => void issuesQuery.refetch()}
          >
            Retry
          </Button>
        </Alert>
      ) : null}

      {!issuesQuery.isLoading && !issuesQuery.isError && items.length === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Create an issue to see it on the board."
          action={
            <Link
              href={`/projects/${projectId}/issues`}
              className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
            >
              Create issue
            </Link>
          }
        />
      ) : null}

      {!issuesQuery.isLoading && items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((status, colIndex) => (
            <Card
              key={status}
              data-status={status}
              className={`tf-board-column tf-enter tf-enter-delay-${colIndex + 1}`}
            >
              <CardHeader className="sticky top-0 z-10">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span>{STATUS_LABEL[status]}</span>
                  <Badge tone={columnBadgeTone(status)}>{byStatus[status].length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                {byStatus[status].map((issue) => (
                  <BoardIssueCard
                    key={issue.id}
                    issue={issue}
                    pendingId={pendingId}
                    pulsedId={pulsedId}
                    onMove={(id, next) => statusMutation.mutate({ id, status: next })}
                  />
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default function BoardPage() {
  return (
    <TaskFlowPage wide>
      <ShellHeader />
      <RequireAuth>
        <BoardContent />
      </RequireAuth>
    </TaskFlowPage>
  );
}
