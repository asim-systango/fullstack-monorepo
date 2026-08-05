'use client';

import { RoleRoute } from '@/components/auth';
import {
  Page,
  PageHeader,
  EmptyState,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@shared/ui/components';

export default function DoctorSchedulePage() {
  return (
    <RoleRoute roles={['staff', 'admin']}>
      <Page>
        <PageHeader
          title="My Schedule"
          description="Manage your consultation slots and view upcoming appointments"
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Slots</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                title="No slots configured"
                description="Your consultation slots will appear here once slot management is implemented."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                title="No appointments today"
                description="Your scheduled appointments for today will appear here."
              />
            </CardBody>
          </Card>
        </div>
      </Page>
    </RoleRoute>
  );
}
