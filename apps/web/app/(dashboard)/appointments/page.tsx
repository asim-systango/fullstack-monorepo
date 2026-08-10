'use client';

import React, { useState } from 'react';
import { Page, PageHeader, EmptyState, Spinner, Button } from '@shared/ui/components';
import { useAppointments, useCancelAppointment } from '@/features/appointment/hooks';
import { AppointmentCard } from '@/components/appointment/appointment-card';
import type { AppointmentStatus } from '@/features/appointment/types';
import { CheckCircle2, Clock, XCircle, Filter } from 'lucide-react';

export default function AppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | AppointmentStatus>('ALL');

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useAppointments(statusFilter === 'ALL' ? undefined : { status: statusFilter });

  const cancelMutation = useCancelAppointment();

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id);
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

    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={handleCancel}
            isCancelling={cancelMutation.isPending}
          />
        ))}
      </div>
    );
  };

  return (
    <Page>
      <PageHeader
        title="My Medical Appointments"
        description="View your scheduled consultations, historical medical visits, prescriptions, and clinical notes."
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border mb-6">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <Button
              key={tab.value}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
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
    </Page>
  );
}
