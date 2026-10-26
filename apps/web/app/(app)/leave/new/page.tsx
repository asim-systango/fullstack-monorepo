import { AppPage } from '@/components/layout';
import { ApplyForm } from '@/components/leave';

export default function ApplyPage() {
  return (
    <AppPage
      title="Apply for leave"
      description="Pick a type and your dates. Weekends and public holidays are not counted."
    >
      <ApplyForm />
    </AppPage>
  );
}
