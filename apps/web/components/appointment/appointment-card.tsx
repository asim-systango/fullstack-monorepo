'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, Badge, Button } from '@shared/ui/components';
import type { Appointment } from '@/features/appointment/types';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Pill,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { FileCode, ShieldCheck } from 'lucide-react';

export interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onComplete?: (appointment: Appointment) => void;
  onExportFhir?: (id: string) => void;
  onSubmitInsurance?: (appointment: Appointment) => void;
  isCancelling?: boolean;
}

export function AppointmentCard({
  appointment,
  onCancel,
  onComplete,
  onExportFhir,
  onSubmitInsurance,
  isCancelling,
}: Readonly<AppointmentCardProps>) {
  const doctor = appointment.slot?.doctor;
  const slot = appointment.slot;

  const apptDate = slot?.startsAt
    ? new Date(slot.startsAt).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date(appointment.createdAt).toLocaleDateString();

  const apptTime = slot?.startsAt
    ? `${new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Time N/A';

  const getStatusBadge = () => {
    switch (appointment.status) {
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

  return (
    <Card className="border border-border/70 hover:border-primary/40 transition-all duration-200 bg-card p-4">
      <CardHeader className="mb-3 pb-3 flex flex-row items-center justify-between border-b border-border/40 space-y-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold text-foreground">
            {apptDate}
          </CardTitle>
        </div>
        {getStatusBadge()}
      </CardHeader>

      <div className="space-y-4">
        {/* Doctor and Time Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {doctor ? (
                `${doctor.firstName[0]}${doctor.lastName[0]}`
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {doctor
                  ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                  : 'Assigned Specialist'}
              </div>
              <div className="text-xs text-muted-foreground">
                {doctor?.specialization ?? 'General Medicine'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md">
            <Clock className="w-4 h-4 text-primary" />
            <span>
              Time Window: <strong className="text-foreground">{apptTime}</strong>
            </span>
          </div>
        </div>

        {/* Reason for visit */}
        {appointment.reason && (
          <div className="text-xs bg-muted/20 p-2.5 rounded-md border border-border/40">
            <span className="font-medium text-foreground flex items-center gap-1 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-primary" />
              Visit Reason:
            </span>
            <p className="text-muted-foreground">{appointment.reason}</p>
          </div>
        )}

        {/* Prescription details if present */}
        {appointment.prescription && (
          <div className="text-xs bg-emerald-500/5 p-3 rounded-md border border-emerald-500/20">
            <div className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
              <Pill className="w-4 h-4" />
              Prescription Issued:
            </div>
            <ul className="space-y-1 text-muted-foreground pl-5 list-disc">
              {appointment.prescription.medicines.map((med, idx) => (
                <li key={idx}>
                  <strong className="text-foreground">{med.name}</strong> ({med.dosage}) —{' '}
                  {med.frequency} {med.duration ? `[${med.duration}]` : ''}
                </li>
              ))}
            </ul>
            {appointment.prescription.instructions && (
              <p className="mt-2 text-xs italic text-muted-foreground border-t border-emerald-500/20 pt-1.5">
                Note: {appointment.prescription.instructions}
              </p>
            )}
          </div>
        )}

        {/* Medical Notes if present (Internal) */}
        {appointment.medicalNotes && appointment.medicalNotes.length > 0 && (
          <div className="text-xs bg-blue-500/5 p-3 rounded-md border border-blue-500/20">
            <div className="font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-1">
              <FileText className="w-4 h-4" />
              Clinical Medical Notes (Doctor Only):
            </div>
            {appointment.medicalNotes.map((note) => (
              <p key={note.id} className="text-muted-foreground mt-1">
                &quot;{note.notes}&quot;
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-border/30">
          {onExportFhir && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportFhir(appointment.id)}
              className="text-xs gap-1"
            >
              <FileCode className="w-3.5 h-3.5 text-primary" /> Export Record
            </Button>
          )}
          {onSubmitInsurance && appointment.status === 'COMPLETED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSubmitInsurance(appointment)}
              className="text-xs gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Claim Insurance
            </Button>
          )}
          {appointment.status === 'SCHEDULED' && onComplete && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onComplete(appointment)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Complete Visit
            </Button>
          )}
          {appointment.status === 'SCHEDULED' && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(appointment.id)}
              loading={isCancelling}
              className="text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
