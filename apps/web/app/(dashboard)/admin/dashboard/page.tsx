'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RoleRoute } from '@/components/auth';
import { useDoctors } from '@/features/doctor/hooks';
import { useAppointments } from '@/features/appointment/hooks';
import {
  Page,
  PageHeader,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@shared/ui/components';
import {
  Users,
  Calendar,
  ArrowRight,
  Search,
  UserPlus,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState('');

  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();

  const activeDoctors = doctors.filter((d) => d.isActive).length;
  const scheduledAppts = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedAppts = appointments.filter((a) => a.status === 'COMPLETED').length;

  const handleQuickSearchSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/admin/appointments?q=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      router.push('/admin/appointments');
    }
  };

  const getStatusBadgeTone = (status: string) => {
    if (status === 'COMPLETED') return 'success';
    if (status === 'CANCELLED') return 'danger';
    return 'accent';
  };

  return (
    <RoleRoute roles={['ADMIN', 'admin']}>
      <Page>
        <PageHeader
          title="Hospital Administration & Operations"
          description="Real-time control center for staff management and clinical appointments."
          actions={
            <div className="flex items-center gap-2">
              <Link href="/admin/doctors">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Manage Staff
                </Button>
              </Link>
              <Link href="/admin/appointments">
                <Button variant="primary" size="sm" className="text-xs gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> View Appointments
                </Button>
              </Link>
            </div>
          }
        />

        {/* Top KPI Metrics Bar */}
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="bg-card p-4 rounded-xl border border-border/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Practitioners
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {doctors.length}
              </h3>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {activeDoctors} Active Profiles
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Hospital Appointments
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {appointments.length}
              </h3>
              <p className="text-[11px] text-primary font-medium mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {scheduledAppts} Scheduled
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Completed Consultations
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {completedAppts}
              </h3>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Finished Appointments
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Doctor Management Card */}
          <Card className="hover:border-primary/50 transition-colors duration-200">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4 text-primary" />
                  Doctor Management
                </CardTitle>
                <Badge tone="success" className="text-[10px]">
                  {activeDoctors} Active
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage practitioner profiles, assign medical specializations, toggle
                active availability, and edit consultation fees.
              </p>

              <div className="bg-muted/30 p-3 rounded-lg border border-border/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Registered Specialists:</span>
                  <span className="font-semibold text-foreground">
                    {doctors.length} Doctors
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.from(new Set(doctors.map((d) => d.specialization)))
                    .slice(0, 3)
                    .map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link href="/register?role=doctor">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2 h-8 text-muted-foreground hover:text-foreground"
                  >
                    + Add Doctor
                  </Button>
                </Link>
                <Link href="/admin/doctors">
                  <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                    Manage Staff <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Appointment Search Card */}
          <Card className="hover:border-primary/50 transition-colors duration-200">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Appointment Search
                </CardTitle>
                <Badge tone="accent" className="text-[10px]">
                  {appointments.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hospital-wide real-time search, status filtering, appointment completions,
                and clinical schedule cancellations.
              </p>

              <form onSubmit={handleQuickSearchSubmit} className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Quick search doctor, reason..."
                  value={quickSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuickSearch(e.target.value)
                  }
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </form>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-emerald-500">{completedAppts}</span>{' '}
                  Completed
                </div>
                <Link href="/admin/appointments">
                  <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                    Hospital Search <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Hospital Activity & Quick Stream */}
        <div className="mt-8 bg-card rounded-xl border border-border/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Recent Clinical Activity Stream
              </h3>
            </div>
            <Badge tone="neutral" className="text-[11px]">
              Live Sync
            </Badge>
          </div>

          <div className="mt-4 divide-y divide-border/40">
            {appointments.slice(0, 4).map((appt) => (
              <div
                key={appt.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    Appt
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Appointment #{appt.id.slice(0, 8)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Patient ID: {appt.patientId.slice(0, 8)}... | Reason:{' '}
                      {appt.reason || 'General Consultation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone={getStatusBadgeTone(appt.status)} className="text-[10px]">
                    {appt.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(appt.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No recent appointment activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </Page>
    </RoleRoute>
  );
}
