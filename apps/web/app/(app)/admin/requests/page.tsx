import { AppPage } from '@/components/layout';
import { TeamRequests } from '@/components/leave';

export default function AllRequestsPage() {
  return (
    <AppPage
      title="All requests"
      description="Every leave request in the company. You decide managers' own leave."
    >
      <TeamRequests mode="admin" />
    </AppPage>
  );
}
