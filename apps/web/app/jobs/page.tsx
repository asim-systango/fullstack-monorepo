'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { JobStatusBadge } from '@/components/status-badges';
import { Alert, Button, Card, CardBody, Field, Input, Skeleton } from '@/components/ui';
import { listPublicJobs } from '@/lib/api/jobs-api';
import { getErrorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';

function JobsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') || '1');
  const titleParam = searchParams.get('title') || '';
  const locationParam = searchParams.get('location') || '';

  const [title, setTitle] = useState(titleParam);
  const [location, setLocation] = useState(locationParam);

  const params = {
    page,
    limit: 10,
    title: titleParam || undefined,
    location: locationParam || undefined,
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: () => listPublicJobs(params),
  });

  function applyFilters(event: { preventDefault(): void }) {
    event.preventDefault();
    const next = new URLSearchParams();
    next.set('page', '1');
    if (title.trim()) next.set('title', title.trim());
    if (location.trim()) next.set('location', location.trim());
    router.push(`/jobs?${next.toString()}`);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <PageShell title="Jobs" description="Open roles from active companies.">
      <Card className="mb-6">
        <CardBody>
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={applyFilters}
          >
            <Field label="Title">
              {({ id }) => (
                <Input
                  id={id}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Engineer"
                />
              )}
            </Field>
            <Field label="Location">
              {({ id }) => (
                <Input
                  id={id}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote"
                />
              )}
            </Field>
            <div className="flex items-end">
              <Button type="submit" fullWidth loading={isFetching}>
                Filter
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}

      {isError ? (
        <Alert tone="danger" title="Could not load jobs">
          {getErrorMessage(error)}
        </Alert>
      ) : null}

      {data && data.data.length === 0 ? (
        <Alert tone="info" title="No jobs found">
          Try clearing filters or check back later.
        </Alert>
      ) : null}

      <ul className="space-y-3">
        {data?.data.map((job) => (
          <li key={job.id}>
            <Card>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-md font-semibold text-primary no-underline hover:text-brand"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-1 text-sm text-secondary">
                    {job.company?.name ?? 'Company'} · {job.location}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      {data && data.total > data.limit ? (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(searchParams.toString());
              next.set('page', String(page - 1));
              router.push(`/jobs?${next.toString()}`);
            }}
          >
            Previous
          </Button>
          <span className="text-sm text-secondary">
            Page {data.page} of {totalPages} · {data.total} jobs
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              const next = new URLSearchParams(searchParams.toString());
              next.set('page', String(page + 1));
              router.push(`/jobs?${next.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      ) : null}
    </PageShell>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<PageShell title="Jobs" />}>
      <JobsList />
    </Suspense>
  );
}
