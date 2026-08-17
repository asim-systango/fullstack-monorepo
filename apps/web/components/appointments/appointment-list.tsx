'use client';

import { EmptyState } from '@shared/ui/components';
import { AppointmentCard, type AppointmentData } from './appointment-card';

type AppointmentListProps = {
  appointments: AppointmentData[];
  onCancelAppointment: (id: string) => void;
  cancellingId?: string | null;
};

export function AppointmentList({
  appointments,
  onCancelAppointment,
  cancellingId,
}: Readonly<AppointmentListProps>) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        title="No Appointments Found"
        description="You have no appointments matching the selected status filter."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((app) => (
        <AppointmentCard
          key={app.id}
          appointment={app}
          onCancel={onCancelAppointment}
          isCancelling={cancellingId === app.id}
        />
      ))}
    </div>
  );
}
