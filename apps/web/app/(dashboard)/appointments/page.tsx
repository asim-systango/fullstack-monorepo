import {
  Page,
  PageHeader,
  EmptyState,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@shared/ui/components';

export default function AppointmentsPage() {
  return (
    <Page>
      <PageHeader
        title="My Appointments"
        description="View and manage your booked appointments"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardBody>
          <EmptyState
            title="No appointments"
            description="Your booked appointments will appear here. Browse doctors to book a slot."
          />
        </CardBody>
      </Card>
    </Page>
  );
}
