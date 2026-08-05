import {
  Page,
  PageHeader,
  EmptyState,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@shared/ui/components';

type DoctorDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { id } = await params;

  return (
    <Page>
      <PageHeader
        title="Doctor Profile"
        description={`Profile and available slots for doctor ${id}`}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardBody>
            <EmptyState
              title="Profile not loaded"
              description="Doctor details will appear here once the API is connected."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Slots</CardTitle>
          </CardHeader>
          <CardBody>
            <EmptyState
              title="No slots loaded"
              description="Available time slots will appear here for booking."
            />
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
