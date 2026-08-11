'use client';

import React, { useState } from 'react';
import { RoleRoute } from '@/components/auth';
import { Page, PageHeader, Button } from '@shared/ui/components';
import { useCurrentDoctor } from '@/features/doctor/hooks';
import { useSlots } from '@/features/slot/hooks';
import { useAppointments } from '@/features/appointment/hooks';

import { ScheduleStats } from '@/components/doctor/schedule/schedule-stats';
import { SlotManagementCard } from '@/components/doctor/schedule/slot-management-card';
import { TodayAppointmentsCard } from '@/components/doctor/schedule/today-appointments-card';
import { CreateSlotModal } from '@/components/doctor/schedule/create-slot-modal';
import { Plus } from 'lucide-react';

export default function DoctorSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0] ?? '',
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: doctor, isLoading: isDoctorLoading } = useCurrentDoctor();
  const doctorId = doctor?.id ?? '';

  const { data: slots = [], isLoading: isSlotsLoading } = useSlots(doctorId);
  const { data: appointments = [], isLoading: isAppointmentsLoading } = useAppointments({
    doctorId,
  });

  return (
    <RoleRoute roles={['DOCTOR', 'ADMIN']}>
      <Page>
        <PageHeader
          title="My Schedule"
          description="Manage your consultation slots, configure availability, and view upcoming appointments"
          actions={
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" /> Add / Generate Slots
            </Button>
          }
        />

        {isDoctorLoading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Overview Metric Cards */}
            <ScheduleStats slots={slots} todayAppointmentsCount={appointments.length} />

            {/* Grid Layout: Slot Management & Today's Appointments */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SlotManagementCard
                slots={slots}
                isLoading={isSlotsLoading}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
              />

              <TodayAppointmentsCard
                appointments={appointments}
                isLoading={isAppointmentsLoading}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        )}

        {/* Create / Bulk Generate Slot Modal */}
        {doctorId && (
          <CreateSlotModal
            doctorId={doctorId}
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </Page>
    </RoleRoute>
  );
}
