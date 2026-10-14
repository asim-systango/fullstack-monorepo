'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { ApplicationStatusBadge } from '@/components/status-badges';
import { Alert, Button, Card, CardBody, Skeleton } from '@/components/ui';
import { listMyApplications } from '@/lib/api/applications-api';
import { getErrorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';

export default function MyApplicationsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.myApplications,
    queryFn: listMyApplications,
  });

  return (
    <PageShell
      title="My applications"
      description="Track every role you have applied to."
      actions={
        <Link href="/my/applications/summary">
          <Button size="sm" variant="secondary">
            Summary
          </Button>
        </Link>
      }
    >
      {isLoading ? <Skeleton className="h-32 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load applications">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      {data && data.length === 0 ? (
        <Alert tone="info" title="No applications yet">
          Browse <Link href="/jobs">open jobs</Link> to apply.
        </Alert>
      ) : null}
      <ul className="space-y-3">
        {data?.map((app) => (
          <li key={app.id}>
            <Card>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">
                    {app.job?.title ?? `Job ${app.jobId}`}
                  </p>
                  <p className="mt-1 text-sm text-secondary">
                    {app.job?.location ?? '—'} · applied{' '}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ApplicationStatusBadge status={app.status} />
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
