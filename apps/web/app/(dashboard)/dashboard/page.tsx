import {
  Page,
  PageHeader,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@shared/ui/components';

export default function DashboardPage() {
  return (
    <Page>
      <PageHeader title="Dashboard" description="Hospital Appointment System overview" />

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Doctors</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-foreground">—</p>
            <p className="text-sm text-muted-foreground">Active practitioners</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Slots</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-foreground">—</p>
            <p className="text-sm text-muted-foreground">Open for booking</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-foreground">—</p>
            <p className="text-sm text-muted-foreground">Scheduled today</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancellations</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-foreground">—</p>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
