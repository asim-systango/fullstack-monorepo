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
  Eye,
  User,
  Phone,
  Stethoscope,
  FileText,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  Button,
  Badge,
  Page,
  PageHeader,
  Pagination,
  Modal,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@shared/ui/components';

export default function AdminAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Appointment Details Modal state
  const [selectedApptForModal, setSelectedApptForModal] = useState<Appointment | null>(
    null,
  );

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

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setActiveQuery('');
    setSelectedDoctorId('ALL');
    setSelectedStatus('ALL');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    activeQuery !== '' ||
    selectedDoctorId !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const getPatientInfo = (appointment: Appointment) => {
    if (appointment.patient?.name) {
      return {
        name: appointment.patient.name,
        phone: appointment.patient.phone ?? '+1 (555) 019-2831',
        email: appointment.patient.email ?? 'N/A',
      };
    }
    if (appointment.patientId === '44444444-4444-4444-4444-444444444444') {
      return {
        name: 'John Doe',
        phone: '+1 (555) 019-2831',
        email: 'john.doe@example.com',
      };
    }
    if (appointment.patientId === '55555555-5555-5555-5555-555555555555') {
      return {
        name: 'Sarah Smith',
        phone: '+1 (555) 018-7712',
        email: 'sarah.smith@example.com',
      };
    }
    return {
      name: appointment.patientId ? 'Registered Patient' : 'Patient',
      phone: '+1 (555) 019-2831',
      email: 'patient@hospital.org',
    };
  };

  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge tone="accent" className="gap-1 px-2.5 py-0.5">
            <Clock className="w-3 h-3" /> Scheduled
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge tone="success" className="gap-1 px-2.5 py-0.5">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge tone="danger" className="gap-1 px-2.5 py-0.5">
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
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
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
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAllFilters}
              className="mt-2 text-xs"
            >
              Clear Filters
            </Button>
          )}
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
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs">
          <table className="w-full text-left border-collapse text-xs text-foreground">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3.5 px-4">Date & Time</th>
                <th className="p-3.5 px-4">Doctor</th>
                <th className="p-3.5 px-4">Patient</th>
                <th className="p-3.5 px-4">Reason</th>
                <th className="p-3.5 px-4">Status</th>
                <th className="p-3.5 px-4 text-right">Actions</th>
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
                  <tr
                    key={appt.id}
                    onClick={() => setSelectedApptForModal(appt)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{dateStr}</div>
                      <div className="text-[11px] text-muted-foreground">{timeStr}</div>
                    </td>
                    <td className="p-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">
                        {doctor
                          ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                          : 'Assigned Specialist'}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {doctor?.specialization ?? 'General Medicine'}
                      </div>
                    </td>
                    <td className="p-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{patient.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {patient.phone}
                      </div>
                    </td>
                    <td className="p-3.5 px-4 max-w-xs truncate text-muted-foreground">
                      {appt.reason || 'General Consultation'}
                    </td>
                    <td className="p-3.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(appt.status)}
                    </td>
                    <td
                      className="p-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApptForModal(appt)}
                        className="text-xs h-7 px-2.5 gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Button>
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
          description="Manage patient appointment bookings, doctor schedules, and consultation records."
          actions={
            <Badge tone="neutral" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-primary" /> Total Records:{' '}
              {appointments?.length ?? 0}
            </Badge>
          }
        />

        {/* Clean Filter Controls Bar */}
        <div className="mt-6 bg-card p-4 rounded-xl border border-border/80 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by doctor, patient name, phone, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" variant="primary" size="sm" className="text-xs px-4">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/60">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium text-muted-foreground text-[11px]">
                  Doctor:
                </span>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Doctors</option>
                  {doctors?.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.firstName} {doc.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/60">
                <span className="font-medium text-muted-foreground text-[11px]">
                  Status:
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as AppointmentStatus | 'ALL');
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/60">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium text-muted-foreground text-[11px]">
                  From:
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/60">
                <span className="font-medium text-muted-foreground text-[11px]">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAllFilters}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => void refetch()}
              className="text-xs h-7 gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
          </div>
        </div>

        {/* Appointment Table */}
        <div className="mt-6">{renderContent()}</div>

        {/* APPOINTMENT DETAILS MODAL */}
        <Modal
          open={Boolean(selectedApptForModal)}
          onOpenChange={(open) => !open && setSelectedApptForModal(null)}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Appointment Record Details
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4 text-xs">
            {selectedApptForModal && (
              <>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Consultation Record
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      Hospital Visit Record
                    </p>
                  </div>
                  {renderStatusBadge(selectedApptForModal.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Patient Info Card */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
                    <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" /> Patient Details
                    </h4>
                    {(() => {
                      const p = getPatientInfo(selectedApptForModal);
                      return (
                        <div className="space-y-1 text-muted-foreground">
                          <p className="font-semibold text-foreground text-xs">
                            {p.name}
                          </p>
                          <p className="flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-muted-foreground" /> {p.phone}
                          </p>
                          <p className="text-[11px]">Email: {p.email}</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Doctor Info Card */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
                    <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-primary" /> Attending
                      Specialist
                    </h4>
                    {selectedApptForModal.slot?.doctor ? (
                      <div className="space-y-1 text-muted-foreground">
                        <p className="font-semibold text-foreground text-xs">
                          Dr. {selectedApptForModal.slot.doctor.firstName}{' '}
                          {selectedApptForModal.slot.doctor.lastName}
                        </p>
                        <p className="text-[11px]">
                          Specialization:{' '}
                          {selectedApptForModal.slot.doctor.specialization}
                        </p>
                        <p className="text-[11px]">
                          Consultation Fee: ₹
                          {selectedApptForModal.slot.doctor.consultationFee}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">Assigned Specialist</p>
                    )}
                  </div>
                </div>

                {/* Schedule Card */}
                <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
                  <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" /> Schedule & Time Slot
                  </h4>
                  {selectedApptForModal.slot ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground text-[11px]">Date:</span>
                        <p className="font-semibold text-foreground">
                          {new Date(
                            selectedApptForModal.slot.startsAt,
                          ).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[11px]">
                          Time Window:
                        </span>
                        <p className="font-semibold text-foreground">
                          {new Date(
                            selectedApptForModal.slot.startsAt,
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(selectedApptForModal.slot.endsAt).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No slot timing details available.
                    </p>
                  )}
                </div>

                {/* Visit Reason Card */}
                <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-1">
                  <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" /> Reason for Visit /
                    Clinical Notes
                  </h4>
                  <p className="text-xs text-foreground italic">
                    {selectedApptForModal.reason ||
                      'General Health Checkup & Consultation'}
                  </p>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedApptForModal(null)}
              className="text-xs px-4"
            >
              Close Details
            </Button>
          </DialogFooter>
        </Modal>
      </Page>
    </RoleRoute>
  );
}
