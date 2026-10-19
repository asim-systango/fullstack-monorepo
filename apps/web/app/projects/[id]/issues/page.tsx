'use client';

import { useMemo, useState, type SyntheticEvent } from 'react';
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
  Field,
  Form,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextArea,
  TextInput,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { IssueStatusBadge } from '@/components/issue-status-badge';
import { PageFetchSkeleton, TagsSkeleton } from '@/components/content-skeletons';
import { issuesApi, labelsApi } from '@/lib/domain-api';
import {
  clearCreateIssueDraft,
  clearIssueFilters,
  setCreateIssueDraft,
  setIssueFilter,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';
import type { IssueStatus } from '@/lib/domain-types';
import { ApiClientError } from '@shared/api-client';
import { useIssueSocket } from '@/hooks/use-issue-socket';

function IssuesContent() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.ui.issueFilters);
  const draft = useAppSelector((s) => s.ui.createIssueDraft);
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  useIssueSocket(true);

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      status: (filters.status || undefined) as IssueStatus | undefined,
      labelId: filters.labelId || undefined,
      assigneeId: filters.assigneeId || undefined,
      q: filters.q || undefined,
    }),
    [filters],
  );

  const issuesQuery = useQuery({
    queryKey: ['project-issues', projectId, listParams],
    queryFn: () => issuesApi.list(projectId, listParams),
    enabled: Boolean(projectId),
  });

  const labelsQuery = useQuery({
    queryKey: ['labels', projectId],
    queryFn: () => labelsApi.list(projectId),
    enabled: Boolean(projectId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      issuesApi.create(projectId, {
        title: draft.title,
        description: draft.description,
      }),
    onSuccess: async () => {
      dispatch(clearCreateIssueDraft());
      setShowCreate(false);
      await queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
    },
  });

  function onCreate(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <>
      <PageHeader
        title="Issues"
        description="Filter, create, and open work items"
        actions={
          <>
            <Link href={`/projects/${projectId}`}>Overview</Link>
            <Link href={`/projects/${projectId}/board`}>Board</Link>
            <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? 'Close' : 'New issue'}
            </Button>
          </>
        }
      />

      <Card className="tf-enter tf-filter-bar mb-4 sticky top-2 z-10">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-4">
          <Field label="Status" htmlFor="filter-status">
            <Select
              id="filter-status"
              value={filters.status}
              onChange={(e) =>
                dispatch(setIssueFilter({ key: 'status', value: e.target.value }))
              }
            >
              <option value="">All</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </Select>
          </Field>
          <Field label="Label" htmlFor="filter-label">
            <Select
              id="filter-label"
              value={filters.labelId}
              onChange={(e) =>
                dispatch(setIssueFilter({ key: 'labelId', value: e.target.value }))
              }
              disabled={labelsQuery.isLoading}
            >
              <option value="">
                {labelsQuery.isLoading ? 'Loading labels…' : 'All'}
              </option>
              {(labelsQuery.data ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Search" htmlFor="filter-q">
            <TextInput
              id="filter-q"
              value={filters.q}
              onChange={(e) =>
                dispatch(setIssueFilter({ key: 'q', value: e.target.value }))
              }
              placeholder="Title or description"
            />
          </Field>
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => dispatch(clearIssueFilters())}>
              Clear
            </Button>
          </div>
        </CardBody>
      </Card>

      {showCreate ? (
        <Card className="tf-enter tf-panel mb-6">
          <CardHeader>
            <CardTitle>New issue</CardTitle>
          </CardHeader>
          <CardBody>
            <Form onSubmit={onCreate} className="space-y-3">
              <Field label="Title" htmlFor="issue-title">
                <TextInput
                  id="issue-title"
                  value={draft.title}
                  onChange={(e) =>
                    dispatch(setCreateIssueDraft({ title: e.target.value }))
                  }
                  required
                  autoFocus
                />
              </Field>
              <Field label="Description" htmlFor="issue-desc">
                <TextArea
                  id="issue-desc"
                  value={draft.description}
                  onChange={(e) =>
                    dispatch(setCreateIssueDraft({ description: e.target.value }))
                  }
                  rows={3}
                />
              </Field>
              <Button type="submit" loading={createMutation.isPending}>
                Create issue
              </Button>
              {createMutation.isError ? (
                <Alert tone="danger">
                  {createMutation.error instanceof ApiClientError
                    ? createMutation.error.message
                    : 'Create failed'}
                </Alert>
              ) : null}
            </Form>
          </CardBody>
        </Card>
      ) : null}

      {labelsQuery.isLoading ? <TagsSkeleton count={5} /> : null}

      {issuesQuery.isLoading ? <PageFetchSkeleton label="Loading issues…" /> : null}

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

      {issuesQuery.data && issuesQuery.data.items.length === 0 ? (
        <EmptyState
          title="No issues match"
          description="Clear filters or create a new issue."
          action={
            <Button variant="secondary" onClick={() => dispatch(clearIssueFilters())}>
              Clear filters
            </Button>
          }
        />
      ) : null}

      {issuesQuery.data && issuesQuery.data.items.length > 0 ? (
        <div className="tf-enter overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Labels</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issuesQuery.data.items.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
                  </TableCell>
                  <TableCell>
                    <IssueStatusBadge status={issue.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((l) => (
                        <Badge key={l.id}>{l.name}</Badge>
                      ))}
                    </div>
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

export default function ProjectIssuesPage() {
  return (
    <TaskFlowPage wide>
      <ShellHeader />
      <RequireAuth>
        <IssuesContent />
      </RequireAuth>
    </TaskFlowPage>
  );
}
