'use client';

import React, { useState } from 'react';
import { RoleRoute } from '@/components/auth';
import { useAppointments, useCancelAppointment } from '@/features/appointment/hooks';
import type { Appointment, AppointmentStatus } from '@/features/appointment/types';
import { AppointmentCard } from '@/components/appointment/appointment-card';
import { CompleteAppointmentModal } from '@/components/appointment/complete-appointment-modal';
import { CancelConfirmationModal } from '@/components/appointment/cancel-confirmation-modal';
import { Calendar, Filter, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { Button, Badge, Page, PageHeader, Pagination } from '@shared/ui/components';

export default function DoctorAppointmentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApptForCompletion, setSelectedApptForCompletion] =
    useState<Appointment | null>(null);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(
    null,
  );

  const filters = {
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
  };

  const { data: appointments, isLoading, isError, refetch } = useAppointments(filters);
  const cancelMutation = useCancelAppointment();

  const handleCompleteClick = (appt: Appointment) => {
    setSelectedApptForCompletion(appt);
  };

  const handleCancelClick = (id: string) => {
    setCancellingAppointmentId(id);
  };

  const handleConfirmCancel = () => {
    if (!cancellingAppointmentId) return;
    cancelMutation.mutate(cancellingAppointmentId, {
      onSuccess: () => {
        setCancellingAppointmentId(null);
      },
    });
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

    const list = appointments ?? [];
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAppts = list.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedAppts.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onComplete={handleCompleteClick}
              onCancel={handleCancelClick}
              isCancelling={
                cancelMutation.isPending && cancellingAppointmentId === appt.id
              }
            />
          ))}
        </div>

        <Pagination
          currentPage={safePage}
          totalItems={list.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  return (
    <RoleRoute roles={['DOCTOR', 'ADMIN']}>
      <Page>
        <PageHeader
          title="Doctor Portal — Consultation Schedule"
          description="Manage your patient visits, document medical consultations, and record prescriptions."
          actions={
            <div className="flex items-center gap-2">
              <Badge tone="accent" className="gap-1 px-3 py-1 text-xs">
                <Clock className="w-3.5 h-3.5" /> {scheduledCount} Pending Visits
              </Badge>
              <Badge tone="success" className="gap-1 px-3 py-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> {completedCount} Completed
              </Badge>
            </div>
          }
        />

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
                  onClick={() => {
                    setSelectedStatus(status);
                    setCurrentPage(1);
                  }}
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

        {/* Cancel Confirmation Modal */}
        <CancelConfirmationModal
          isOpen={Boolean(cancellingAppointmentId)}
          onClose={() => setCancellingAppointmentId(null)}
          onConfirm={handleConfirmCancel}
          isLoading={cancelMutation.isPending}
        />
      </Page>
    </RoleRoute>
  );
}
