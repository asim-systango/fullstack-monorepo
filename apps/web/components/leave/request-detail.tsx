'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Button, Card, CardBody } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { ConfirmDialog, useToast } from '@/components/feedback';
import { AppPage, ButtonLink } from '@/components/layout';
import { formatDateTime, formatRange } from '@/lib/leave/dates';
import { errorMessage } from '@/lib/leave/errors';
import { plural } from '@/lib/leave/format';
import { useCancelRequest, useRemoveRequest } from '@/lib/leave/queries';
import type { LeaveRequest } from '@/lib/leave/types';
import { StatusBadge } from './status-badge';

function Detail({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 text-sm text-foreground sm:col-span-2">{children}</dd>
    </div>
  );
}

function decisionText(request: LeaveRequest) {
  if (!request.decidedBy || !request.decidedAt) return 'Not decided yet';
  return `${request.decidedBy.name}, ${formatDateTime(request.decidedAt)}`;
}

export function RequestDetail({ request }: Readonly<{ request: LeaveRequest }>) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const cancel = useCancelRequest();
  const remove = useRemoveRequest();
  const [dialog, setDialog] = useState<'cancel' | 'remove' | null>(null);

  const isOwner = user?.id === request.employee.id;
  // approved requests can't be cancelled, and a rejection stays unless an admin removes it
  const canCancel = isOwner && request.status === 'pending';
  const canRemove = isOwner && request.status === 'cancelled';

  function confirmCancel() {
    cancel.mutate(request.id, {
      onSuccess: () => {
        setDialog(null);
        toast('Request cancelled');
      },
    });
  }

  function confirmRemove() {
    remove.mutate(request.id, {
      onSuccess: () => {
        toast('Request removed from your history');
        router.push('/leave');
      },
    });
  }

  return (
    <AppPage
      title={`${request.leaveType.name} leave`}
      description={formatRange(request.startDate, request.endDate)}
      actions={
        <>
          {canCancel ? (
            <Button variant="danger" onClick={() => setDialog('cancel')}>
              Cancel request
            </Button>
          ) : null}
          {canRemove ? (
            <Button variant="secondary" onClick={() => setDialog('remove')}>
              Remove from history
            </Button>
          ) : null}
          <ButtonLink href="/leave" variant="ghost">
            Back to my leave
          </ButtonLink>
        </>
      }
    >
      <Card className="max-w-2xl">
        <CardBody>
          <dl className="m-0">
            <Detail label="Status">
              <StatusBadge status={request.status} />
            </Detail>
            <Detail label="Employee">{request.employee.name}</Detail>
            <Detail label="Dates">
              {formatRange(request.startDate, request.endDate)}
            </Detail>
            <Detail label="Working days">{plural(request.days, 'day')}</Detail>
            <Detail label="Reason">{request.reason}</Detail>
            <Detail label="Submitted">{formatDateTime(request.createdAt)}</Detail>
            <Detail label="Decided by">{decisionText(request)}</Detail>
            <Detail label="Manager's comment">{request.managerComment ?? '—'}</Detail>
          </dl>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={dialog === 'cancel'}
        title="Cancel this request?"
        description="It will be marked as cancelled and the days go back to your balance."
        confirmLabel="Cancel request"
        danger
        pending={cancel.isPending}
        error={cancel.isError ? errorMessage(cancel.error) : null}
        onConfirm={confirmCancel}
        onClose={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'remove'}
        title="Remove from your history?"
        description="The request is hidden from your list. Nothing changes on your balance."
        confirmLabel="Remove"
        pending={remove.isPending}
        error={remove.isError ? errorMessage(remove.error) : null}
        onConfirm={confirmRemove}
        onClose={() => setDialog(null)}
      />
    </AppPage>
  );
}
