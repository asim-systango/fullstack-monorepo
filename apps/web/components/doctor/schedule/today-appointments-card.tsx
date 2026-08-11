'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Badge,
  Button,
  EmptyState,
  Pagination,
} from '@shared/ui/components';
import type { Appointment } from '@/features/appointment/types';
import { useCompleteAppointment } from '@/features/appointment/hooks';
import { Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';

interface TodayAppointmentsCardProps {
  appointments: Appointment[];
  isLoading?: boolean;
  selectedDate: string;
}

function getAppointmentBadgeTone(status: string): 'success' | 'danger' | 'warning' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED') return 'danger';
  return 'warning';
}

function getCardHeaderTitle(isToday: boolean, selectedDate: string): string {
  if (isToday) return "Today's Appointments";
  return `Appointments (${selectedDate})`;
}

export function TodayAppointmentsCard({
  appointments,
  isLoading,
  selectedDate,
}: Readonly<TodayAppointmentsCardProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const completeAppointment = useCompleteAppointment();

  // Filter appointments for the selected date
  const filteredAppointments = appointments.filter((app) => {
    if (!app.slot?.startsAt) return true;
    const appDate = new Date(app.slot.startsAt).toISOString().split('T')[0] ?? '';
    return appDate === selectedDate;
  });

  const handleComplete = async (id: string) => {
    try {
      await completeAppointment.mutateAsync({ id });
    } catch {
      // Handled by react query
    }
  };

  const isToday = selectedDate === (new Date().toISOString().split('T')[0] ?? '');

  const renderAppointmentContent = () => {
    if (isLoading) {
      return (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <EmptyState
          title="No appointments scheduled"
          description={`Your scheduled appointments for ${selectedDate} will appear here once booked by patients.`}
        />
      );
    }

    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAppts = filteredAppointments.slice(
      (safePage - 1) * pageSize,
      safePage * pageSize,
    );

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {paginatedAppts.map((app) => {
            const startTime = app.slot?.startsAt
              ? new Date(app.slot.startsAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'N/A';
            const endTime = app.slot?.endsAt
              ? new Date(app.slot.endsAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'N/A';

            return (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-border bg-card/80 hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        Patient ID: {app.patientId.slice(0, 8)}...
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary" /> {startTime} –{' '}
                          {endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    tone={getAppointmentBadgeTone(app.status)}
                    className="text-xs px-2.5 py-0.5"
                  >
                    {app.status}
                  </Badge>
                </div>

                {app.reason && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Reason:</strong> {app.reason}
                    </span>
                  </div>
                )}

                {app.status === 'SCHEDULED' && (
                  <div className="flex items-center justify-end pt-2 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(app.id)}
                      loading={completeAppointment.isPending}
                      className="h-8 text-xs gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Pagination
          currentPage={safePage}
          totalItems={filteredAppointments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {getCardHeaderTitle(isToday, selectedDate)}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scheduled consultations for the selected date
          </p>
        </div>

        <Badge tone="neutral" className="text-xs">
          {filteredAppointments.length} Scheduled
        </Badge>
      </CardHeader>

      <CardBody className="pt-4 space-y-3">{renderAppointmentContent()}</CardBody>
    </Card>
  );
}
