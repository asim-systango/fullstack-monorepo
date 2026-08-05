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

export default function AdminPage() {
  return (
    <RoleRoute roles={['admin']}>
      <Page>
        <PageHeader
          title="Admin Panel"
          description="Hospital-wide administration and system settings"
        />

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Management</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                title="Coming soon"
                description="Manage doctor profiles, create and deactivate practitioners."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Search</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                title="Coming soon"
                description="Hospital-wide appointment search and filtering."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                title="Coming soon"
                description="System configuration and settings management."
              />
            </CardBody>
          </Card>
        </div>
      </Page>
    </RoleRoute>
  );
}
