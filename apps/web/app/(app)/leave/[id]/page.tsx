'use client';

import { useParams } from 'next/navigation';
import { EmptyState } from '@shared/ui/components';
import { QueryErrorAlert, TableSkeleton } from '@/components/feedback';
import { AppPage, ButtonLink } from '@/components/layout';
import { RequestDetail } from '@/components/leave';
import { errorStatus } from '@/lib/leave/errors';
import { useLeaveRequest } from '@/lib/leave/queries';

export default function LeaveRequestPage() {
  const { id } = useParams<{ id: string }>();
  const request = useLeaveRequest(id);

  if (request.isPending) {
    return (
      <AppPage title="Leave request">
        <TableSkeleton rows={4} />
      </AppPage>
    );
  }

  if (request.isError) {
    const status = errorStatus(request.error);
    // deleted, someone else's, or a broken link: all look the same to the user
    if (status === 404 || status === 400) {
      return (
        <AppPage title="Leave request">
          <EmptyState
            title="This request is no longer available"
            description="It may have been removed, or the link is wrong."
            action={<ButtonLink href="/leave">Back to my leave</ButtonLink>}
          />
        </AppPage>
      );
    }
    return (
      <AppPage title="Leave request">
        <QueryErrorAlert error={request.error} onRetry={() => void request.refetch()} />
      </AppPage>
    );
  }

  return <RequestDetail request={request.data} />;
}
