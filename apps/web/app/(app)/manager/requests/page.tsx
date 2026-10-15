import { AppPage } from '@/components/layout';
import { TeamRequests } from '@/components/leave';

export default function ApprovalsPage() {
  return (
    <AppPage
      title="Approvals"
      description="Approve or reject your team's leave. Your own requests are decided by an admin."
    >
      <TeamRequests mode="manager" />
    </AppPage>
  );
}
