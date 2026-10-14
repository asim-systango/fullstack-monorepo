'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { ApplicationStatusBadge } from '@/components/status-badges';
import { Alert, Card, CardBody, Field, Select, Skeleton } from '@/components/ui';
import { listCompanyApplications } from '@/lib/api/applications-api';
import { getErrorMessage } from '@/lib/api/errors';
import type { ApplicationStatus } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

function CompanyApplicationsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get('status') || '') as ApplicationStatus | '';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.companyApplications(status || undefined),
    queryFn: () => listCompanyApplications(status || undefined),
  });

  return (
    <PageShell
      title="Company applications"
      description="Filter by status query param (submitted|reviewing|rejected|hired)."
    >
      <div className="mb-4 max-w-xs">
        <Field label="Status">
          {({ id }) => (
            <Select
              id={id}
              value={status}
              onChange={(e) => {
                const value = e.target.value;
                const next = new URLSearchParams();
                if (value) next.set('status', value);
                router.push(
                  next.toString()
                    ? `/company/applications?${next.toString()}`
                    : '/company/applications',
                );
              }}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'submitted', label: 'submitted' },
                { value: 'reviewing', label: 'reviewing' },
                { value: 'rejected', label: 'rejected' },
                { value: 'hired', label: 'hired' },
              ]}
            />
          )}
        </Field>
      </div>

      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load applications">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      {data && data.length === 0 ? (
        <Alert tone="info" title="No applications">
          Nothing matches this filter.
        </Alert>
      ) : null}

      <ul className="space-y-3">
        {data?.map((app) => (
          <li key={app.id}>
            <Card>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/company/applications/${app.id}`}
                    className="font-semibold text-primary no-underline hover:text-brand"
                  >
                    {app.job?.title ?? `Application ${app.id}`}
                  </Link>
                  <p className="mt-1 text-sm text-secondary">
                    Candidate {app.candidateUserId.slice(0, 8)}… ·{' '}
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

export default function CompanyApplicationsPage() {
  return (
    <Suspense fallback={<PageShell title="Company applications" />}>
      <CompanyApplicationsList />
    </Suspense>
  );
}
