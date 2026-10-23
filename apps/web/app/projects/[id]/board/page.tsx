'use client';

import { useState, type DragEvent } from 'react';
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
} from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { IssueStatusBadge } from '@/components/issue-status-badge';
import { PageFetchSkeleton } from '@/components/content-skeletons';
import { issuesApi } from '@/lib/domain-api';
import { ALLOWED_TRANSITIONS, STATUS_LABEL } from '@/lib/status';
import type { Issue, IssueStatus } from '@/lib/domain-types';
import { ApiClientError } from '@shared/api-client';
import { useIssueSocket } from '@/hooks/use-issue-socket';

const COLUMNS: IssueStatus[] = ['todo', 'in_progress', 'done'];
const DND_MIME = 'application/x-taskflow-issue';

function columnBadgeTone(status: IssueStatus): 'neutral' | 'accent' | 'success' {
  if (status === 'done') return 'success';
  if (status === 'in_progress') return 'accent';
  return 'neutral';
}

function BoardIssueCard({
  issue,
  pendingId,
  pulsedId,
  draggingId,
  onMove,
  onDragStart,
  onDragEnd,
}: Readonly<{
  issue: Issue;
  pendingId: string | null;
  pulsedId: string | null;
  draggingId: string | null;
  onMove: (id: string, status: IssueStatus) => void;
  onDragStart: (issue: Issue) => void;
  onDragEnd: () => void;
}>) {
  const busy = pendingId === issue.id;

  return (
    <article
      className={`tf-board-card tf-card-lift${draggingId === issue.id ? ' tf-board-card-dragging' : ''}`}
      draggable={!busy}
      onDragStart={(e) => {
        e.dataTransfer.setData(
          DND_MIME,
          JSON.stringify({ id: issue.id, from: issue.status }),
        );
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(issue);
      }}
      onDragEnd={onDragEnd}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link
          href={`/issues/${issue.id}`}
          className="font-medium leading-snug"
          draggable={false}
        >
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
      <p className="tf-board-drag-hint">Drag to another column</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {ALLOWED_TRANSITIONS[issue.status].map((next) => (
          <Button
            key={next}
            size="sm"
            variant="secondary"
            loading={busy}
            disabled={pendingId !== null && pendingId !== issue.id}
            onClick={() => onMove(issue.id, next)}
          >
            → {STATUS_LABEL[next]}
          </Button>
        ))}
      </div>
    </article>
  );
}

function BoardColumn({
  status,
  issues,
  colIndex,
  pendingId,
  pulsedId,
  draggingId,
  dropTarget,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropColumn,
}: Readonly<{
  status: IssueStatus;
  issues: Issue[];
  colIndex: number;
  pendingId: string | null;
  pulsedId: string | null;
  draggingId: string | null;
  dropTarget: IssueStatus | null;
  onMove: (id: string, next: IssueStatus) => void;
  onDragStart: (issue: Issue) => void;
  onDragEnd: () => void;
  onDragOverColumn: (status: IssueStatus, e: DragEvent) => void;
  onDragLeaveColumn: (status: IssueStatus) => void;
  onDropColumn: (status: IssueStatus, e: DragEvent) => void;
}>) {
  const active = dropTarget === status;

  return (
    <Card
      data-status={status}
      data-drop-active={active ? 'true' : 'false'}
      className={`tf-board-column tf-enter tf-enter-delay-${colIndex + 1}${active ? ' tf-board-column-drop' : ''}`}
      onDragOver={(e) => onDragOverColumn(status, e)}
      onDragLeave={() => onDragLeaveColumn(status)}
      onDrop={(e) => onDropColumn(status, e)}
    >
      <CardHeader className="sticky top-0 z-10">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>{STATUS_LABEL[status]}</span>
          <Badge tone={columnBadgeTone(status)}>{issues.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardBody className="tf-board-column-body space-y-3">
        {issues.map((issue) => (
          <BoardIssueCard
            key={issue.id}
            issue={issue}
            pendingId={pendingId}
            pulsedId={pulsedId}
            draggingId={draggingId}
            onMove={onMove}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {issues.length === 0 ? (
          <p className="tf-board-empty-col">Drop issues here</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

function BoardContent() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pulsedId, setPulsedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<IssueStatus | null>(null);
  const [dropTarget, setDropTarget] = useState<IssueStatus | null>(null);
  const [dndError, setDndError] = useState<string | null>(null);
  useIssueSocket(true, projectId);

  const issuesQuery = useQuery({
    queryKey: ['project-issues', projectId, { board: true }],
    queryFn: () => issuesApi.list(projectId, { limit: 100 }),
    enabled: Boolean(projectId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IssueStatus }) =>
      issuesApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      setPendingId(id);
      setDndError(null);
      await queryClient.cancelQueries({ queryKey: ['project-issues', projectId] });
      const key = ['project-issues', projectId, { board: true }] as const;
      const previous = queryClient.getQueryData<{ items: Issue[] }>(key);
      if (previous) {
        queryClient.setQueryData(key, {
          ...previous,
          items: previous.items.map((issue) =>
            issue.id === id ? { ...issue, status } : issue,
          ),
        });
      }
      return { previous, key };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(ctx.key, ctx.previous);
      }
      setDndError(err instanceof ApiClientError ? err.message : 'Status update failed');
    },
    onSuccess: async (_data, vars) => {
      setPulsedId(vars.id);
      await queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
      window.setTimeout(() => setPulsedId(null), 700);
    },
    onSettled: () => setPendingId(null),
  });

  function moveIssue(id: string, next: IssueStatus) {
    const issue = (issuesQuery.data?.items ?? []).find((i) => i.id === id);
    if (!issue || issue.status === next) return;
    if (!ALLOWED_TRANSITIONS[issue.status].includes(next)) {
      setDndError(
        `Can't jump from ${STATUS_LABEL[issue.status]} to ${STATUS_LABEL[next]} — move step by step.`,
      );
      return;
    }
    statusMutation.mutate({ id, status: next });
  }

  function onDragStart(issue: Issue) {
    setDraggingId(issue.id);
    setDragFrom(issue.status);
    setDndError(null);
  }

  function onDragEnd() {
    setDraggingId(null);
    setDragFrom(null);
    setDropTarget(null);
  }

  function onDragOverColumn(status: IssueStatus, e: DragEvent) {
    e.preventDefault();
    if (!dragFrom) return;
    const allowed = dragFrom === status || ALLOWED_TRANSITIONS[dragFrom].includes(status);
    e.dataTransfer.dropEffect = allowed ? 'move' : 'none';
    setDropTarget(allowed ? status : null);
  }

  function onDragLeaveColumn(status: IssueStatus) {
    setDropTarget((cur) => (cur === status ? null : cur));
  }

  function onDropColumn(status: IssueStatus, e: DragEvent) {
    e.preventDefault();
    setDropTarget(null);
    const raw = e.dataTransfer.getData(DND_MIME);
    setDraggingId(null);
    setDragFrom(null);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as { id: string; from: IssueStatus };
      moveIssue(payload.id, status);
    } catch {
      setDndError('Could not read dragged issue');
    }
  }

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
        description="Drag cards between columns, or use the buttons — status rules still apply."
        actions={
          <>
            <Link href={`/projects/${projectId}`}>Overview</Link>
            <Link href={`/projects/${projectId}/issues`}>List</Link>
          </>
        }
      />

      {statusMutation.isError || dndError ? (
        <Alert tone="danger" className="mb-3">
          {dndError ??
            (statusMutation.error instanceof ApiClientError
              ? statusMutation.error.message
              : 'Status update failed')}
        </Alert>
      ) : null}

      {issuesQuery.isLoading ? <PageFetchSkeleton label="Loading board…" /> : null}

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
        <div className="tf-board-grid">
          {COLUMNS.map((status, colIndex) => (
            <BoardColumn
              key={status}
              status={status}
              issues={byStatus[status]}
              colIndex={colIndex}
              pendingId={pendingId}
              pulsedId={pulsedId}
              draggingId={draggingId}
              dropTarget={dropTarget}
              onMove={moveIssue}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverColumn={onDragOverColumn}
              onDragLeaveColumn={onDragLeaveColumn}
              onDropColumn={onDropColumn}
            />
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
