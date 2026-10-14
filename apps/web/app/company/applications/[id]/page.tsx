'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { ApplicationStatusBadge } from '@/components/status-badges';
import { Alert, Button, Card, CardBody, Skeleton } from '@/components/ui';
import {
  getCompanyApplication,
  updateApplicationStatus,
} from '@/lib/api/applications-api';
import { getErrorMessage } from '@/lib/api/errors';
import { APPLICATION_STATUS_TRANSITIONS, type ApplicationStatus } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

type ApplicationDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default function CompanyApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.companyApplication(id),
    queryFn: () => getCompanyApplication(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) => updateApplicationStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.companyApplication(id) });
      await queryClient.invalidateQueries({ queryKey: ['company', 'applications'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.staffDashboard });
    },
  });

  if (isLoading) {
    return (
      <PageShell title="Application">
        <Skeleton className="h-40 w-full" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell title="Application">
        <Alert tone="danger" title="Could not load application">
          {getErrorMessage(error)}
        </Alert>
      </PageShell>
    );
  }

  const nextStatuses = APPLICATION_STATUS_TRANSITIONS[data.status];

  return (
    <PageShell
      title={data.job?.title ?? 'Application'}
      description={`Candidate ${data.candidateUserId}`}
      actions={<ApplicationStatusBadge status={data.status} />}
    >
      <Card className="mb-4">
        <CardBody>
          <h2 className="text-sm font-semibold text-secondary">Cover letter</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-primary">
            {data.coverLetter}
          </p>
          {data.resumeUrl ? (
            <p className="mt-3 text-sm">
              Resume:{' '}
              <a href={data.resumeUrl} target="_blank" rel="noreferrer">
                {data.resumeUrl}
              </a>
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="text-md font-semibold">Update status</h2>
          <p className="mt-1 text-sm text-secondary">
            Buttons follow the server transition graph as a UX aid. The API still enforces
            rules — a 400 will be shown if rejected.
          </p>
          {statusMutation.isError ? (
            <Alert tone="danger" className="mt-3" title="Status update failed">
              {getErrorMessage(statusMutation.error)}
            </Alert>
          ) : null}
          {statusMutation.isSuccess ? (
            <Alert tone="success" className="mt-3">
              Status updated to {statusMutation.data.status}.
            </Alert>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {nextStatuses.length === 0 ? (
              <p className="text-sm text-secondary">
                Terminal status — no further transitions.
              </p>
            ) : (
              nextStatuses.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={status === 'rejected' ? 'danger' : 'primary'}
                  loading={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(status)}
                >
                  Mark {status}
                </Button>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </PageShell>
  );
}
