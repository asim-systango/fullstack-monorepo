'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Badge,
  Button,
  type BadgeTone,
} from '@shared/ui/components';
import { Calendar, Clock, Stethoscope, User, XCircle } from 'lucide-react';

export type AppointmentData = {
  id: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
};

type AppointmentCardProps = {
  appointment: AppointmentData;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
};

export function AppointmentCard({
  appointment,
  onCancel,
  isCancelling,
}: Readonly<AppointmentCardProps>) {
  const statusBadgeTone: Record<AppointmentData['status'], BadgeTone> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    COMPLETED: 'neutral',
    CANCELLED: 'danger',
  };

  return (
    <Card className="hover:border-primary/40 transition-all shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                {appointment.doctorName}
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">{appointment.specialty}</p>
            </div>
          </div>
          <Badge tone={statusBadgeTone[appointment.status]}>{appointment.status}</Badge>
        </div>
      </CardHeader>

      <CardBody className="py-3 text-xs space-y-2 text-muted-foreground border-t border-border/40 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            <span>{appointment.timeSlot}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <User className="size-3.5 text-muted-foreground" />
          <span>
            Patient:{' '}
            <strong className="text-foreground">{appointment.patientName}</strong>
          </span>
        </div>

        {appointment.notes && (
          <p className="text-[11px] italic bg-muted/30 p-2 rounded-md border border-border/40">
            &quot;{appointment.notes}&quot;
          </p>
        )}
      </CardBody>

      {appointment.status !== 'CANCELLED' &&
        appointment.status !== 'COMPLETED' &&
        onCancel && (
          <CardFooter className="pt-2 border-t border-border/40 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(appointment.id)}
              loading={isCancelling}
              className="text-xs text-destructive hover:bg-destructive/10 gap-1.5 h-8"
            >
              <XCircle className="size-3.5" /> Cancel Appointment
            </Button>
          </CardFooter>
        )}
    </Card>
  );
}
