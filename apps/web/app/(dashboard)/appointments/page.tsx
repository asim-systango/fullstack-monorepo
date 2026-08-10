'use client';

import { Page, PageHeader } from '@shared/ui/components';
import {
  AppointmentFilterBar,
  AppointmentList,
  BookingWizardModal,
  type AppointmentData,
} from '@/components/appointments';
import { useAppointmentStore } from '@/lib/store';
import { useState, useMemo } from 'react';

const INITIAL_APPOINTMENTS: AppointmentData[] = [
  {
    id: 'app-101',
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    patientName: 'John Doe',
    date: '2026-08-15',
    timeSlot: '10:30 AM',
    status: 'CONFIRMED',
    notes: 'Routine cardiovascular checkup and blood pressure monitoring.',
  },
  {
    id: 'app-102',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Neurology',
    patientName: 'John Doe',
    date: '2026-08-20',
    timeSlot: '02:00 PM',
    status: 'PENDING',
    notes: 'Follow-up for migraine assessment.',
  },
];

function cancelItemInList(list: AppointmentData[], targetId: string): AppointmentData[] {
  return list.map((app) => (app.id === targetId ? { ...app, status: 'CANCELLED' } : app));
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] =
    useState<AppointmentData[]>(INITIAL_APPOINTMENTS);
  const filterStatus = useAppointmentStore((state) => state.filterStatus);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    if (filterStatus === 'ALL') return appointments;
    return appointments.filter((app) => app.status === filterStatus);
  }, [appointments, filterStatus]);

  const handleCancelAppointment = (id: string) => {
    setCancellingId(id);
    setTimeout(() => {
      setAppointments((prev) => cancelItemInList(prev, id));
      setCancellingId(null);
    }, 500);
  };

  return (
    <Page>
      <PageHeader
        title="My Scheduled Appointments"
        description="Review, filter, or manage your active medical consultation slots."
      />

      <AppointmentFilterBar />

      <AppointmentList
        appointments={filteredAppointments}
        onCancelAppointment={handleCancelAppointment}
        cancellingId={cancellingId}
      />

      <BookingWizardModal />
    </Page>
  );
}
