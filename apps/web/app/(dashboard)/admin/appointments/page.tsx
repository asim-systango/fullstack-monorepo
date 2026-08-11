'use client';

import React, { useState } from 'react';
import { useAppointments, useCancelAppointment } from '@/features/appointment/hooks';
import type { Appointment, AppointmentStatus } from '@/features/appointment/types';
import { useDoctors } from '@/features/doctor/hooks';
import { AppointmentCard } from '@/components/appointment/appointment-card';
import { CompleteAppointmentModal } from '@/components/appointment/complete-appointment-modal';
import {
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  Calendar,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Button, Badge } from '@shared/ui/components';

export default function AdminAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [selectedApptForCompletion, setSelectedApptForCompletion] =
    useState<Appointment | null>(null);

  const { data: doctors } = useDoctors();

  const filters = {
    q: activeQuery.trim() !== '' ? activeQuery.trim() : undefined,
    doctorId: selectedDoctorId === 'ALL' ? undefined : selectedDoctorId,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
  };

  const { data: appointments, isLoading, isError, refetch } = useAppointments(filters);
  const cancelMutation = useCancelAppointment();

  const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
  };

  const handleCancel = (id: string) => {
    if (
      confirm(
        'Admin Action: Are you sure you want to cancel this appointment and release the slot?',
      )
    ) {
      cancelMutation.mutate(id);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Searching hospital records...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center text-xs space-y-2">
          <p>
            Error retrieving hospital appointments. Please check authorization or network
            settings.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    if (appointments?.length === 0) {
      return (
        <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            No matching appointments
          </h3>
          <p className="text-xs text-muted-foreground">
            No records matched your search query or filter parameters.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments?.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            onComplete={(a) => setSelectedApptForCompletion(a)}
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
            <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Hospital Appointment Search & Administration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search, filter, monitor, and manage clinical appointments across all hospital
            departments.
          </p>
        </div>
        <Badge tone="neutral" className="gap-1 px-3 py-1 text-xs self-start md:self-auto">
          <Building2 className="w-3.5 h-3.5" /> Total Records: {appointments?.length ?? 0}
        </Badge>
      </div>

      {/* Hospital Search & Filter Bar */}
      <div className="bg-card p-4 rounded-xl border border-border/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, patient ID, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="text-xs px-4">
            Search
          </Button>
          {activeQuery && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">Doctor:</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Doctors</option>
                {doctors?.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.firstName} {doc.lastName} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as AppointmentStatus | 'ALL')
                }
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-7 gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>
      </div>

      {/* Appointment Grid */}
      {renderContent()}

      {/* Completion Modal */}
      <CompleteAppointmentModal
        appointment={selectedApptForCompletion}
        isOpen={Boolean(selectedApptForCompletion)}
        onClose={() => setSelectedApptForCompletion(null)}
      />
    </div>
  );
}
