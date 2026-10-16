import { AppPage } from '@/components/layout';
import { WhosAway } from '@/components/leave';

export default function WhosAwayPage() {
  return (
    <AppPage
      title="Who's away"
      description="Approved leave for the next 14 days, by date. Weekends and public holidays are skipped."
    >
      <WhosAway />
    </AppPage>
  );
}
