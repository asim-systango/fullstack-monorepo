'use client';
import { use } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  EmptyState,
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
} from '@shared/ui/components';
import { ShellHeader } from '@/components/auth';
import {
  useAppDispatch,
  useAppSelector,
  clearIssueFilters,
  setIssueFilter,
  setIssuePage,
} from '@/lib/store';
import { useIssues } from '@/lib/domain/issues';
import { useLabels } from '@/lib/domain/labels';

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
