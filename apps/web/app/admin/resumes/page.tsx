'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { ResumeFilters } from '@/components/resumes/resume-filters';
import { resumesApi, templatesApi } from '@/lib/resumes-api';
import { resetFilters, useAppDispatch, useAppSelector } from '@/lib/store';

const PAGE_SIZE = 20;

export default function AdminResumesPage() {
  return (
    <Page>
      <ShellHeader title="All resumes" subtitle="Admin overview" />
      <RequireAuth role="admin">
        <AdminResumesList />
      </RequireAuth>
    </Page>
  );
}

function AdminResumesList() {
  const dispatch = useAppDispatch();
  const applied = useAppSelector((s) => s.ui.appliedFilter);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [applied.status, applied.templateId, applied.q]);

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
  });

  const listQuery = useQuery({
    queryKey: [
      'resumes',
      'admin',
      {
        status: applied.status || undefined,
        templateId: applied.templateId || undefined,
        q: applied.q || undefined,
        page,
      },
    ],
    queryFn: () =>
      resumesApi.listAll({
        status: applied.status || undefined,
        templateId: applied.templateId || undefined,
        q: applied.q || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  let resumesBody: ReactNode;
  if (listQuery.isLoading) {
    resumesBody = <LoadingState label="Loading resumes…" />;
  } else if (listQuery.isError) {
    const message =
      listQuery.error instanceof ApiClientError
        ? listQuery.error.message
        : 'Request failed';
    resumesBody = (
      <Alert tone="danger" title="Could not load resumes">
        {message}
      </Alert>
    );
  } else if (!listQuery.data?.items.length) {
    resumesBody = (
      <EmptyState
        title="No resumes match"
        description="Try clearing filters."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              dispatch(resetFilters());
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        }
      />
    );
  } else {
    resumesBody = (
      <>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Owner</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Template</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listQuery.data.items.map((resume) => (
              <TableRow key={resume.id}>
                <TableCell>{resume.title}</TableCell>
                <TableCell>{resume.ownerName || '—'}</TableCell>
                <TableCell>
                  <Badge tone={resume.status === 'published' ? 'success' : 'neutral'}>
                    {resume.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {resume.template
                    ? `${resume.template.name} (${resume.template.key})`
                    : '—'}
                </TableCell>
                <TableCell className="font-mono text-xs">{resume.slug ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="All resumes"
        description="Filter across every candidate resume"
      />

      <ResumeFilters templates={templatesQuery.data ?? []} />

      {resumesBody}
    </>
  );
}
