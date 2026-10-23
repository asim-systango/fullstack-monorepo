'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, EmptyState, PageHeader } from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { IssueStatusBadge } from '@/components/issue-status-badge';
import { PageFetchSkeleton } from '@/components/content-skeletons';
import { EmptySparkArt, IssuesInboxArt } from '@/components/tf-illustrations';
import { issuesApi, projectsApi } from '@/lib/domain-api';
import { useIssueSocket } from '@/hooks/use-issue-socket';

function DashboardContent() {
  useIssueSocket(true);

  const mineQuery = useQuery({
    queryKey: ['my-issues'],
    queryFn: () => issuesApi.mine({ limit: 50 }),
  });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list({ limit: 100 }),
  });

  const projectLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projectsQuery.data?.items ?? []) {
      map.set(p.id, `${p.key} · ${p.name}`);
    }
    return map;
  }, [projectsQuery.data]);

  const todoCount = mineQuery.data?.items.filter((i) => i.status === 'todo').length ?? 0;
  const progressCount =
    mineQuery.data?.items.filter((i) => i.status === 'in_progress').length ?? 0;

  return (
    <>
      <div className="tf-domain-hero tf-enter">
        <div className="tf-domain-hero-copy">
          <PageHeader
            title="My open issues"
            description="Todo and in-progress work assigned to you — live updates when the board moves."
          />
          {mineQuery.data ? (
            <div className="tf-stat-row">
              <span className="tf-stat-pill">{todoCount} todo</span>
              <span className="tf-stat-pill tf-stat-pill-accent">
                {progressCount} in progress
              </span>
            </div>
          ) : null}
        </div>
        <IssuesInboxArt />
      </div>

      {mineQuery.isLoading ? <PageFetchSkeleton label="Loading your issues…" /> : null}

      {mineQuery.isError ? (
        <Alert tone="danger">
          {(mineQuery.error as Error).message}
          <Button
            size="sm"
            variant="secondary"
            className="ml-2"
            onClick={() => void mineQuery.refetch()}
          >
            Retry
          </Button>
        </Alert>
      ) : null}

      {mineQuery.data && mineQuery.data.items.length === 0 ? (
        <div className="tf-empty-stage tf-enter">
          <EmptySparkArt />
          <EmptyState
            title="Inbox zero"
            description="No open issues assigned to you. Grab something from a project board."
            action={
              <Link
                href="/projects"
                className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
              >
                Browse projects
              </Link>
            }
          />
        </div>
      ) : null}

      {mineQuery.data && mineQuery.data.items.length > 0 ? (
        <ul className="tf-issue-stack">
          {mineQuery.data.items.map((issue, index) => (
            <li
              key={issue.id}
              className={`tf-issue-row tf-card-lift tf-enter tf-enter-delay-${Math.min(index, 3) || 1}`}
              data-status={issue.status}
            >
              <div className="tf-issue-row-main">
                <Link href={`/issues/${issue.id}`} className="tf-issue-title">
                  {issue.title}
                </Link>
                <div className="tf-issue-meta">
                  <IssueStatusBadge status={issue.status} />
                  <Link
                    href={`/projects/${issue.projectId}`}
                    className="tf-issue-project"
                  >
                    {projectLabel.get(issue.projectId) ?? 'Project'}
                  </Link>
                </div>
              </div>
              <Link
                href={`/issues/${issue.id}`}
                className="tf-issue-go"
                aria-label={`Open ${issue.title}`}
              >
                Open →
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default function DashboardPage() {
  return (
    <TaskFlowPage wide>
      <ShellHeader />
      <RequireAuth>
        <DashboardContent />
      </RequireAuth>
    </TaskFlowPage>
  );
}
