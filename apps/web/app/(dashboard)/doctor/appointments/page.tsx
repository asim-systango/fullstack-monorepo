'use client';

import React, { useState } from 'react';
import { useAppointments, useCancelAppointment } from '@/features/appointment/hooks';
import type { Appointment, AppointmentStatus } from '@/features/appointment/types';
import { AppointmentCard } from '@/components/appointment/appointment-card';
import { CompleteAppointmentModal } from '@/components/appointment/complete-appointment-modal';
import {
  Stethoscope,
  Calendar,
  Filter,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button, Badge } from '@shared/ui/components';

export default function DoctorAppointmentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [selectedApptForCompletion, setSelectedApptForCompletion] =
    useState<Appointment | null>(null);

  const filters = {
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
  };

  const { data: appointments, isLoading, isError, refetch } = useAppointments(filters);
  const cancelMutation = useCancelAppointment();

  const handleCompleteClick = (appt: Appointment) => {
    setSelectedApptForCompletion(appt);
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled appointment?')) {
      cancelMutation.mutate(id);
    }
  };

  const totalCount = appointments?.length ?? 0;
  const scheduledCount =
    appointments?.filter((a) => a.status === 'SCHEDULED').length ?? 0;
  const completedCount =
    appointments?.filter((a) => a.status === 'COMPLETED').length ?? 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">
            Loading your consultation schedule...
          </p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center text-xs space-y-2">
          <p>
            Failed to load appointments. Please check your credentials or network
            connection.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    if (totalCount === 0) {
      const emptyMessage =
        selectedStatus === 'ALL'
          ? 'You currently have no booked patient consultations.'
          : `No appointments matching status "${selectedStatus}".`;

      return (
        <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No appointments found</h3>
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments?.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            onComplete={handleCompleteClick}
            onCancel={handleCancel}
            isCancelling={cancelMutation.isPending}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-primary" />
            Doctor Portal — Consultation Schedule
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your patient visits, document medical consultations, and record
            prescriptions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent" className="gap-1 px-3 py-1 text-xs">
            <Clock className="w-3.5 h-3.5" /> {scheduledCount} Pending Visits
          </Badge>
          <Badge tone="success" className="gap-1 px-3 py-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> {completedCount} Completed
          </Badge>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Filter Status:</span>
          <div className="flex items-center gap-1.5 ml-2">
            {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="text-xs h-8 px-3"
              >
                {status === 'ALL' && 'All Appointments'}
                {status === 'SCHEDULED' && 'Scheduled'}
                {status === 'COMPLETED' && 'Completed'}
                {status === 'CANCELLED' && 'Cancelled'}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="text-xs h-8"
        >
          Refresh List
        </Button>
      </div>

      {/* Content Body */}
      {renderContent()}

      {/* Clinical Completion Modal */}
      <CompleteAppointmentModal
        appointment={selectedApptForCompletion}
        isOpen={Boolean(selectedApptForCompletion)}
        onClose={() => setSelectedApptForCompletion(null)}
      />
    </div>
  );
}
