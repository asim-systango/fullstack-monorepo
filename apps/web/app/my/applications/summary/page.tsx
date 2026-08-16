'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Skeleton } from '@/components/ui';
import { getMyApplicationsSummary } from '@/lib/api/applications-api';
import { getErrorMessage } from '@/lib/api/errors';
import type { ApplicationStatus } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

const statuses: ApplicationStatus[] = ['submitted', 'reviewing', 'rejected', 'hired'];

export default function MyApplicationsSummaryPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.myApplicationsSummary,
    queryFn: getMyApplicationsSummary,
  });

  return (
    <PageShell
      title="Applications summary"
      description="Counts by status from GET /my/applications/summary."
      actions={
        <Link href="/my/applications">
          <Button size="sm" variant="outline">
            All applications
          </Button>
        </Link>
      }
    >
      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load summary">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => (
          <Card key={status}>
            <CardBody>
              <p className="text-sm capitalize text-secondary">{status}</p>
              <p className="mt-1 text-xl font-semibold text-primary">
                {data?.byStatus?.[status] ?? 0}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
