'use client';

import { useRouter } from 'next/navigation';
import { ShellHeader } from '@/components/auth';
import { Alert, Card, CardBody, LoadingState, PageHeader } from '@shared/ui/components';
import { EventForm } from '@/components/EventForm';
import { useCreateEvent, type CreateEventInput } from '@/hooks/useEvents';
import { useAuth } from '@/components/auth/auth-provider';

export default function NewEventPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const createMutation = useCreateEvent();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <LoadingState label="Authenticating session..." />
        </main>
      </div>
    );
  }

  const isOrganizer = user?.role === 'admin' || user?.role === 'staff';

  const handleSubmit = (values: CreateEventInput) => {
    createMutation.mutate(values, {
      onSuccess: (newEvent) => {
        router.push(`/events/${newEvent.id}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShellHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        <PageHeader
          title="Create New Event"
          description="Publish an event with custom capacity, category, schedule, and automatic waitlist management"
        />

        {!isOrganizer ? (
          <Alert tone="danger" title="Access Restricted">
            Only Admin or Staff organizers can publish new events. Please log in as
            staff@demo.local.
          </Alert>
        ) : (
          <Card className="border border-border/80 bg-card shadow-sm">
            <CardBody className="p-6">
              {createMutation.isError && (
                <Alert tone="danger" title="Failed to create event">
                  {createMutation.error.message}
                </Alert>
              )}

              <EventForm
                onSubmit={handleSubmit}
                pending={createMutation.isPending}
                submitText="Publish Event"
              />
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}
