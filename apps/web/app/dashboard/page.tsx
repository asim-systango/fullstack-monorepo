'use client';

import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Card, CardBody, Skeleton } from '@/components/ui';
import { getStaffDashboard } from '@/lib/api/companies-api';
import { getErrorMessage } from '@/lib/api/errors';
import type { ApplicationStatus } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

const statuses: ApplicationStatus[] = ['submitted', 'reviewing', 'rejected', 'hired'];

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.staffDashboard,
    queryFn: getStaffDashboard,
  });

  return (
    <PageShell
      title="Dashboard"
      description="Open jobs and applications by status for your company."
    >
      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load dashboard">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardBody>
              <p className="text-sm text-secondary">Open jobs</p>
              <p className="mt-1 text-xl font-semibold">{data.openJobCount}</p>
            </CardBody>
          </Card>
          {statuses.map((status) => (
            <Card key={status}>
              <CardBody>
                <p className="text-sm capitalize text-secondary">{status}</p>
                <p className="mt-1 text-xl font-semibold">
                  {data.applicationsByStatus?.[status] ?? 0}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
