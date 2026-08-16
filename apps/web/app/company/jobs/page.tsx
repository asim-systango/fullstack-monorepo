'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { JobStatusBadge } from '@/components/status-badges';
import { Alert, Button, Card, CardBody, Skeleton } from '@/components/ui';
import { getErrorMessage } from '@/lib/api/errors';
import { closeJob, deleteJob, listCompanyJobs } from '@/lib/api/jobs-api';
import { queryKeys } from '@/lib/query/keys';

export default function CompanyJobsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.companyJobs,
    queryFn: listCompanyJobs,
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => closeJob(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.companyJobs }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.companyJobs }),
  });

  return (
    <PageShell
      title="Company jobs"
      description="Includes soft-deleted history (withDeleted on the API)."
      actions={
        <Link href="/company/jobs/new">
          <Button size="sm">New job</Button>
        </Link>
      }
    >
      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load jobs">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      {(closeMutation.isError || deleteMutation.isError) && (
        <Alert tone="danger" className="mb-3">
          {getErrorMessage(closeMutation.error ?? deleteMutation.error)}
        </Alert>
      )}
      <ul className="space-y-3">
        {data?.map((job) => (
          <li key={job.id}>
            <Card>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{job.title}</p>
                  <p className="mt-1 text-sm text-secondary">{job.location}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <JobStatusBadge status={job.status} deleted={Boolean(job.deletedAt)} />
                  {!job.deletedAt ? (
                    <>
                      <Link href={`/company/jobs/${job.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      {job.status === 'open' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={closeMutation.isPending}
                          onClick={() => {
                            if (confirm('Close this job and reject open applications?')) {
                              closeMutation.mutate(job.id);
                            }
                          }}
                        >
                          Close
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="danger"
                        loading={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm('Soft-delete this job?')) {
                            deleteMutation.mutate(job.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
