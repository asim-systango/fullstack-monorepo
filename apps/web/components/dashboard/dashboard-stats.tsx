'use client';

import { useAuth } from '@/components/auth';
import { Card } from '@shared/ui/components';
import {
  CalendarCheck,
  Stethoscope,
  Clock,
  ShieldCheck,
  Users,
  Activity,
} from 'lucide-react';
import { useAppointments } from '@/features/appointment/hooks';
import { useDoctors } from '@/features/doctor/hooks';

export function DashboardStats() {
  const { user } = useAuth();
  const role = (user?.role || 'PATIENT').toUpperCase();

  const { data: appointments } = useAppointments();
  const { data: doctors } = useDoctors();

  const apptCount = appointments?.length ?? 0;
  const scheduledCount =
    appointments?.filter((a) => a.status === 'SCHEDULED').length ?? 0;
  const completedCount =
    appointments?.filter((a) => a.status === 'COMPLETED').length ?? 0;
  const doctorCount = doctors?.length ?? 0;

  if (role === 'ADMIN') {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{apptCount}</p>
            <p className="text-xs text-muted-foreground font-medium">
              Hospital Appointments
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{doctorCount}</p>
            <p className="text-xs text-muted-foreground font-medium">
              Active Specialists
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Pending Scheduled</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Completed Visits</p>
          </div>
        </Card>
      </div>
    );
  }

  if (role === 'DOCTOR' || role === 'STAFF') {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarCheck className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{apptCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Assigned Visits</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Pending Visits</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground font-medium">
              Completed Consultations
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">Active</p>
            <p className="text-xs text-muted-foreground font-medium">Clinical Duty</p>
          </div>
        </Card>
      </div>
    );
  }

  // PATIENT / DEFAULT
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarCheck className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{apptCount}</p>
          <p className="text-xs text-muted-foreground font-medium">My Bookings</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Stethoscope className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{doctorCount}</p>
          <p className="text-xs text-muted-foreground font-medium">
            Specialists Available
          </p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{scheduledCount}</p>
          <p className="text-xs text-muted-foreground font-medium">Upcoming Visits</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">100%</p>
          <p className="text-xs text-muted-foreground font-medium">Slot Guarantee</p>
        </div>
      </Card>
    </div>
  );
}
