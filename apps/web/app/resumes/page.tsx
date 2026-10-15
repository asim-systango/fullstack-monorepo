'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export default function ResumesListPage() {
  return (
    <Page>
      <ShellHeader title="My resumes" subtitle="Create, edit, and publish" />
      <RequireAuth role="user">
        <ResumesList />
      </RequireAuth>
    </Page>
  );
}

function ResumesList() {
  const dispatch = useAppDispatch();
  const applied = useAppSelector((s) => s.ui.appliedFilter);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

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
      'own',
      {
        status: applied.status || undefined,
        templateId: applied.templateId || undefined,
        q: applied.q || undefined,
        page,
      },
    ],
    queryFn: () =>
      resumesApi.listOwn({
        status: applied.status || undefined,
        templateId: applied.templateId || undefined,
        q: applied.q || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => resumesApi.duplicate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (err) => {
      setActionError(err instanceof ApiClientError ? err.message : 'Duplicate failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: (err) => {
      setActionError(err instanceof ApiClientError ? err.message : 'Delete failed');
    },
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
        title="No resumes yet"
        description="Create a resume or clear your filters."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/resumes/new"
              className="ui-button ui-button-primary no-underline hover:no-underline"
            >
              New resume
            </Link>
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
          </div>
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
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Template</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listQuery.data.items.map((resume) => (
              <TableRow key={resume.id}>
                <TableCell>
                  <Link href={`/resumes/${resume.id}/edit`}>{resume.title}</Link>
                </TableCell>
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
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Link
                      href={`/resumes/${resume.id}/edit`}
                      className="ui-button ui-button-sm ui-button-ghost no-underline hover:no-underline"
                    >
                      Edit
                    </Link>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      loading={
                        duplicateMutation.isPending &&
                        duplicateMutation.variables === resume.id
                      }
                      onClick={() => {
                        setActionError(null);
                        duplicateMutation.mutate(resume.id);
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      loading={
                        deleteMutation.isPending && deleteMutation.variables === resume.id
                      }
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Delete “${resume.title}”? This cannot be undone from the list.`,
                          )
                        ) {
                          return;
                        }
                        setActionError(null);
                        deleteMutation.mutate(resume.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
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
        title="Resumes"
        description="Your drafts and published resumes"
        actions={
          <Link
            href="/resumes/new"
            className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
          >
            New resume
          </Link>
        }
      />

      <ResumeFilters templates={templatesQuery.data ?? []} />

      {actionError ? (
        <Alert tone="danger" title="Action failed" className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      {resumesBody}
    </>
  );
}
