'use client';

import React, { useState, useEffect } from 'react';
import {
  Page,
  PageHeader,
  EmptyState,
  Spinner,
  Button,
  Pagination,
} from '@shared/ui/components';
import {
  useAppointments,
  useCancelAppointment,
  useBookAppointment,
} from '@/features/appointment/hooks';
import { AppointmentCard } from '@/components/appointment/appointment-card';
import { CancelConfirmationModal } from '@/components/appointment/cancel-confirmation-modal';
import type { AppointmentStatus } from '@/features/appointment/types';
import { CheckCircle2, Clock, XCircle, Filter, ShieldCheck } from 'lucide-react';

import { FhirExportModal } from '@/components/export/fhir-export-modal';

export default function AppointmentsPage() {
  const [paymentBanner, setPaymentBanner] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | AppointmentStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(
    null,
  );
  const [exportingAppointmentId, setExportingAppointmentId] = useState<string | null>(
    null,
  );

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useAppointments(statusFilter === 'ALL' ? undefined : { status: statusFilter });

  const cancelMutation = useCancelAppointment();
  const bookMutation = useBookAppointment();

  const hasHandledRef = React.useRef(false);

  useEffect(() => {
    if (hasHandledRef.current || typeof window === 'undefined') return;

    const search = new URLSearchParams(window.location.search);
    const sessionId = search.get('session_id');
    const status = search.get('status');
    const slotId = search.get('slotId') || search.get('slot_id');

    if (sessionId || status === 'success') {
      hasHandledRef.current = true;
      setPaymentBanner(
        'Payment completed successfully! Your consultation slot has been reserved.',
      );
      if (slotId) {
        bookMutation.mutate(
          { slotId, reason: 'Paid Consultation Slot' },
          {
            onSuccess: () => {
              void refetch();
            },
            onSettled: () => {
              const url = new URL(window.location.href);
              url.searchParams.delete('session_id');
              url.searchParams.delete('status');
              url.searchParams.delete('slot_id');
              url.searchParams.delete('slotId');
              url.searchParams.delete('mock');
              window.history.replaceState({}, '', url.pathname);
            },
          },
        );
      } else {
        void refetch();
      }
    }
  }, [bookMutation, refetch]);

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

  const tabs: {
    label: string;
    value: 'ALL' | AppointmentStatus;
    icon: React.ReactNode;
  }[] = [
    { label: 'All Appointments', value: 'ALL', icon: <Filter className="w-3.5 h-3.5" /> },
    { label: 'Scheduled', value: 'SCHEDULED', icon: <Clock className="w-3.5 h-3.5" /> },
    {
      label: 'Completed',
      value: 'COMPLETED',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    { label: 'Cancelled', value: 'CANCELLED', icon: <XCircle className="w-3.5 h-3.5" /> },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground">Loading appointment schedule...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="py-12">
          <EmptyState
            title="Failed to Load Appointments"
            description="An error occurred while fetching your medical appointment records."
            action={
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Try Again
              </Button>
            }
          />
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="py-12">
          <EmptyState
            title="No Appointments Found"
            description={
              statusFilter === 'ALL'
                ? "You haven't scheduled any medical consultations yet."
                : `No appointments found matching status "${statusFilter}".`
            }
            action={
              statusFilter !== 'ALL' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter('ALL')}
                >
                  View All Appointments
                </Button>
              ) : undefined
            }
          />
        </div>
      );
    }

    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(appointments.length / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAppts = appointments.slice(
      (safePage - 1) * pageSize,
      safePage * pageSize,
    );

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {paginatedAppts.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancelClick}
              onExportFhir={(id) => setExportingAppointmentId(id)}
              isCancelling={
                cancelMutation.isPending && cancellingAppointmentId === appointment.id
              }
            />
          ))}
        </div>

        <Pagination
          currentPage={safePage}
          totalItems={appointments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  return (
    <Page>
      <PageHeader
        title="My Medical Appointments"
        description="View your scheduled consultations, historical medical visits, prescriptions, and clinical notes."
      />

      {/* Payment Success Alert Banner */}
      {paymentBanner && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3 text-sm animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-medium">{paymentBanner}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
            onClick={() => setPaymentBanner(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border mb-6">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <Button
              key={tab.value}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`gap-2 text-xs h-9 px-4 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={Boolean(cancellingAppointmentId)}
        onClose={() => setCancellingAppointmentId(null)}
        onConfirm={handleConfirmCancel}
        isLoading={cancelMutation.isPending}
      />

      {/* FHIR R4 / HL7 Record Export Modal */}
      <FhirExportModal
        open={Boolean(exportingAppointmentId)}
        onOpenChange={(open) => !open && setExportingAppointmentId(null)}
        appointmentId={exportingAppointmentId || ''}
      />
    </Page>
  );
}
