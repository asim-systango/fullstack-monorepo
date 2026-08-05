import {
  Page,
  PageHeader,
  EmptyState,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@shared/ui/components';

export default function DoctorsPage() {
  return (
    <Page>
      <PageHeader title="Doctors" description="Browse our medical practitioners" />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Doctor Directory</CardTitle>
        </CardHeader>
        <CardBody>
          <EmptyState
            title="No doctors loaded"
            description="Doctor profiles will appear here once the API is connected."
          />
        </CardBody>
      </Card>
    </Page>
  );
}
