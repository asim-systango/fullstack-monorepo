'use client';
import { use } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Form,
  Page,
  Select,
  Spinner,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from '@shared/ui/components';
import { ShellHeader } from '@/components/auth';
import {
  useAppDispatch,
  useAppSelector,
  clearIssueFilters,
  setIssueFilter,
  setIssuePage,
} from '@/lib/store';
import { useCreateIssue, useIssues } from '@/lib/domain/issues';
import { useProjectMembers } from '@/lib/domain/projects';
import { useLabels } from '@/lib/domain/labels';

function CreateIssueForm({ projectId }: Readonly<{ projectId: string }>) {
  const create = useCreateIssue(projectId);
  const members = useProjectMembers(projectId);
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>New issue</CardTitle>
      </CardHeader>
      <Form
        pending={create.isPending}
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(
            { title, assigneeId: assigneeId || undefined },
            {
              onSuccess: () => {
                setTitle('');
                setAssigneeId('');
              },
            },
          );
        }}
      >
        <Field label="Title" htmlFor="i-title" required>
          <TextInput
            id="i-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Assignee" htmlFor="i-assignee">
          <Select
            id="i-assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.data?.map((m) => (
              <option key={m.id} value={m.userId}>
                {m.userId.slice(0, 8)} — {m.projectRole}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" loading={create.isPending}>
          Create issue
        </Button>
        {create.isError && (
          <StatusMessage tone="error">Create failed — check the fields.</StatusMessage>
        )}
      </Form>
    </Card>
  );
}

export default function IssuesTablePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.issueFilters);
  const labels = useLabels(id);
  const { data, isLoading, isError } = useIssues(id, {
    status: filters.status || undefined,
    labelId: filters.labelId || undefined,
    assigneeId: filters.assigneeId || undefined,
    page: filters.page,
  });

  return (
    <Page>
      <ShellHeader title="Issues" subtitle="Filter the backlog" />
      <CreateIssueForm projectId={id} />
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status}
          onChange={(e) => dispatch(setIssueFilter({ status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
        <Select
          value={filters.labelId}
          onChange={(e) => dispatch(setIssueFilter({ labelId: e.target.value }))}
        >
          <option value="">All labels</option>
          {labels.data?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <Button variant="ghost" onClick={() => dispatch(clearIssueFilters())}>
          Clear
        </Button>
      </div>

      {isLoading && <Spinner />}
      {isError && <StatusMessage tone="error">Failed to load issues.</StatusMessage>}
      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="No issues match" description="Try clearing the filters." />
      )}

      {data && data.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <Link href={`/issues/${i.id}`}>{i.title}</Link>
                </TableCell>
                <TableCell>
                  <Badge>{i.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={filters.page <= 1}
          onClick={() => dispatch(setIssuePage(filters.page - 1))}
        >
          Prev
        </Button>
        <span>Page {filters.page}</span>
        <Button
          variant="secondary"
          disabled={(data?.length ?? 0) < 20}
          onClick={() => dispatch(setIssuePage(filters.page + 1))}
        >
          Next
        </Button>
      </div>
    </Page>
  );
}
