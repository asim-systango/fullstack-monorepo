'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  EmptyState,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { IssueStatusBadge } from '@/components/issue-status-badge';
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

  return (
    <>
      <PageHeader
        title="My open issues"
        description="Todo and in-progress work assigned to you"
      />

      {mineQuery.isLoading ? (
        <div className="space-y-2" aria-hidden>
          <Skeleton size="line" />
          <Skeleton size="md" />
          <Skeleton size="md" />
        </div>
      ) : null}

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
        <EmptyState
          title="Inbox zero"
          description="No open issues assigned to you."
          action={
            <Link
              href="/projects"
              className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
            >
              Browse projects
            </Link>
          }
        />
      ) : null}

      {mineQuery.data && mineQuery.data.items.length > 0 ? (
        <div className="tf-enter tf-panel overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mineQuery.data.items.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
                  </TableCell>
                  <TableCell>
                    <IssueStatusBadge status={issue.status} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/projects/${issue.projectId}`}>
                      {projectLabel.get(issue.projectId) ?? 'Project'}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
