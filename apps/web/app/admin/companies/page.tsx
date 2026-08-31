'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input, Skeleton } from '@/components/ui';
import {
  forceCloseJob,
  listAdminCompanies,
  reactivateCompany,
  suspendCompany,
} from '@/lib/api/admin-api';
import { getErrorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState('');
  const [forceMessage, setForceMessage] = useState<string | null>(null);
  const [forceError, setForceError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.adminCompanies,
    queryFn: listAdminCompanies,
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendCompany(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCompanies }),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => reactivateCompany(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCompanies }),
  });

  const forceCloseMutation = useMutation({
    mutationFn: (id: string) => forceCloseJob(id),
    onSuccess: (job) => {
      setForceMessage(`Job ${job.id} force-closed (status=${job.status}).`);
      setForceError(null);
      setJobId('');
    },
    onError: (err) => {
      setForceMessage(null);
      setForceError(getErrorMessage(err));
    },
  });

  function onForceClose(event: { preventDefault(): void }) {
    event.preventDefault();
    setForceError(null);
    setForceMessage(null);
    forceCloseMutation.mutate(jobId.trim());
  }

  return (
    <PageShell
      title="Admin · Companies"
      description="Suspend/reactivate companies. There is no GET /admin/jobs — force-close by job id below."
      actions={
        <Link href="/admin/staff/new">
          <Button size="sm" variant="secondary">
            Create staff
          </Button>
        </Link>
      }
    >
      <Card className="mb-6">
        <CardBody>
          <h2 className="text-md font-semibold">Force-close job</h2>
          <p className="mt-1 text-sm text-secondary">
            POST /admin/jobs/:id/force-close — paste a job UUID (no admin job browser
            exists yet).
          </p>
          <form
            className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={onForceClose}
          >
            <Field label="Job id" className="flex-1">
              {({ id }) => (
                <Input
                  id={id}
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  placeholder="uuid"
                  required
                />
              )}
            </Field>
            <Button type="submit" loading={forceCloseMutation.isPending}>
              Force close
            </Button>
          </form>
          {forceError ? (
            <Alert tone="danger" className="mt-3">
              {forceError}
            </Alert>
          ) : null}
          {forceMessage ? (
            <Alert tone="success" className="mt-3">
              {forceMessage}
            </Alert>
          ) : null}
        </CardBody>
      </Card>

      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load companies">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      {(suspendMutation.isError || reactivateMutation.isError) && (
        <Alert tone="danger" className="mb-3">
          {getErrorMessage(suspendMutation.error ?? reactivateMutation.error)}
        </Alert>
      )}

      <ul className="space-y-3">
        {data?.map((company) => (
          <li key={company.id}>
            <Card>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{company.name}</p>
                  <p className="mt-1 text-sm text-secondary">
                    {company.website || 'No website'} ·{' '}
                    {company.suspended ? 'suspended' : 'active'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {company.suspended ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={reactivateMutation.isPending}
                      onClick={() => reactivateMutation.mutate(company.id)}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={suspendMutation.isPending}
                      onClick={() => {
                        if (confirm(`Suspend ${company.name}?`)) {
                          suspendMutation.mutate(company.id);
                        }
                      }}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
