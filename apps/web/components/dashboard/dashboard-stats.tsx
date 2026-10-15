'use client';

import { useAuth } from '@/components/auth';
import { Card } from '@shared/ui/components';
import {
  CalendarCheck,
  Stethoscope,
  Clock,
  ShieldCheck,
  Activity,
  IndianRupee,
  Building2,
  Wallet,
} from 'lucide-react';
import { useAppointments } from '@/features/appointment/hooks';
import { useDoctors } from '@/features/doctor/hooks';

export function DashboardStats() {
  const { user } = useAuth();
  const role = (user?.role || 'PATIENT').toUpperCase();

  const { data: appointments = [] } = useAppointments();
  const { data: doctors = [] } = useDoctors();

  const apptCount = appointments.length;
  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const doctorCount = doctors.length;

  // Active (non-cancelled) appointments for revenue statistics
  const activeAppts = appointments.filter((a) => a.status !== 'CANCELLED');

  const totalRevenue = activeAppts.reduce((sum, a) => {
    const docFee = Number(a.consultationFee ?? a.slot?.doctor?.consultationFee ?? 100);
    const hospFee = Number(a.hospitalCharge ?? a.slot?.doctor?.hospitalCharge ?? 10);
    return sum + (Number(a.totalAmount) || docFee + hospFee);
  }, 0);

  const totalHospitalCharges = activeAppts.reduce((sum, a) => {
    return sum + Number(a.hospitalCharge ?? a.slot?.doctor?.hospitalCharge ?? 10);
  }, 0);

  const totalDoctorPayouts = activeAppts.reduce((sum, a) => {
    return sum + Number(a.consultationFee ?? a.slot?.doctor?.consultationFee ?? 100);
  }, 0);

  if (role === 'ADMIN') {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-4 flex items-center gap-3 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            <IndianRupee className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              ₹{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Total Revenue Collected
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 border-indigo-500/30 bg-indigo-500/5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              ₹{totalHospitalCharges.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Hospital Platform Fee
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 border-blue-500/30 bg-blue-500/5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              ₹{totalDoctorPayouts.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-medium">Total Doctor Fees</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{doctorCount}</p>
            <p className="text-xs text-muted-foreground font-medium">
              Active Doctors ({apptCount} Appts)
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (role === 'DOCTOR' || role === 'STAFF') {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="p-4 flex items-center gap-3 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            <IndianRupee className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              ₹{totalDoctorPayouts.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Doctor Fee Earnings
            </p>
          </div>
        </Card>

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
