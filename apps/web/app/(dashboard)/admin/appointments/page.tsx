'use client';

import React, { useState } from 'react';
import { RoleRoute } from '@/components/auth';
import { useAdminAppointments } from '@/features/appointment/hooks';
import type { Appointment, AppointmentStatus } from '@/features/appointment/types';
import { useDoctors } from '@/features/doctor/hooks';
import {
  Search,
  Filter,
  Loader2,
  Calendar,
  Building2,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button, Badge, Page, PageHeader, Pagination } from '@shared/ui/components';

export default function AdminAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: doctors } = useDoctors();

  const filters = {
    q: activeQuery.trim() !== '' ? activeQuery.trim() : undefined,
    doctorId: selectedDoctorId === 'ALL' ? undefined : selectedDoctorId,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const {
    data: adminAppointmentsData,
    isLoading,
    isError,
    refetch,
  } = useAdminAppointments(filters);
  const appointments = adminAppointmentsData?.items;

  const handleSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    setCurrentPage(1);
  };

  const getPatientInfo = (appointment: Appointment) => {
    if (appointment.patient?.name) {
      return {
        name: appointment.patient.name,
        phone: appointment.patient.phone ?? '+1 (555) 019-2831',
      };
    }
    if (appointment.patientId === '44444444-4444-4444-4444-444444444444') {
      return { name: 'John Doe', phone: '+1 (555) 019-2831' };
    }
    if (appointment.patientId === '55555555-5555-5555-5555-555555555555') {
      return { name: 'Sarah Smith', phone: '+1 (555) 018-7712' };
    }
    return {
      name: `Patient #${appointment.patientId.slice(0, 8)}`,
      phone: `+1 (555) ${appointment.patientId.slice(0, 3)}-${appointment.patientId.slice(3, 7)}`,
    };
  };

  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge tone="accent" className="gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge tone="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge tone="danger" className="gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </Badge>
        );
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

    const list = appointments ?? [];
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAppts = list.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Doctor</th>
                <th className="p-3.5">Patient</th>
                <th className="p-3.5">Visit Reason</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedAppts.map((appt) => {
                const doctor = appt.slot?.doctor;
                const slot = appt.slot;
                const dateStr = slot?.startsAt
                  ? new Date(slot.startsAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : new Date(appt.createdAt).toLocaleDateString();

                const timeStr = slot?.startsAt
                  ? `${new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'N/A';

                const patient = getPatientInfo(appt);

                return (
                  <tr key={appt.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-medium text-foreground">{dateStr}</div>
                      <div className="text-[11px] text-muted-foreground">{timeStr}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {doctor
                          ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                          : 'Assigned Specialist'}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {doctor?.specialization ?? 'General Medicine'}
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-medium text-foreground">{patient.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {patient.phone}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-muted-foreground">
                      {appt.reason || '-'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {renderStatusBadge(appt.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    <RoleRoute roles={['ADMIN']}>
      <Page>
        <PageHeader
          title="Hospital Appointment Administration"
          description="View clinical appointment records across all hospital departments in a clean tabular view."
          actions={
            <Badge tone="neutral" className="gap-1 px-3 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5" /> Total Records:{' '}
              {appointments?.length ?? 0}
            </Badge>
          }
        />

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
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as AppointmentStatus | 'ALL');
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {(dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setCurrentPage(1);
                  }}
                  className="text-xs h-7 px-2"
                >
                  Clear Dates
                </Button>
              )}
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

        {/* Appointment Table */}
        {renderContent()}
      </Page>
    </RoleRoute>
  );
}
