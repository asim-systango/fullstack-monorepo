'use client';

import React from 'react';
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
} from '@shared/ui/components';
import { DashboardStats } from '@/components/dashboard';
import { BookingWizardModal } from '@/components/appointments';
import { useUiStore } from '@/lib/store';
import { useAuth } from '@/components/auth';
import {
  CalendarPlus,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

function AdminActions() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle>Hospital Appointments</CardTitle>
              <p className="text-xs text-muted-foreground">
                Search across all departments
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Access hospital-wide appointment search, filter by practitioner or patient,
            and audit bookings.
          </p>
          <Link href="/admin/appointments">
            <Button
              variant="primary"
              size="sm"
              className="gap-2 w-full sm:w-auto text-xs"
            >
              Open Admin Appointments <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardBody>
      </Card>

      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <CardTitle>Doctor Directory</CardTitle>
              <p className="text-xs text-muted-foreground">
                Physician records & management
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            View board-certified specialists directory and manage active doctor profiles.
          </p>
          <Link href="/admin/doctors">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto text-xs"
            >
              Manage Doctors <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardBody>
      </Card>

      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Settings className="size-5" />
            </div>
            <div>
              <CardTitle>Admin Panel</CardTitle>
              <p className="text-xs text-muted-foreground">System settings & access</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Configure global system parameters, audit logs, and security controls.
          </p>
          <Link href="/admin/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto text-xs"
            >
              Open Admin Panel <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

function DoctorActions() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <CardTitle>My Consultations</CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage assigned patient visits
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Review scheduled patient appointments, enter medical notes, and issue
            prescriptions.
          </p>
          <Link href="/doctor/appointments">
            <Button
              variant="primary"
              size="sm"
              className="gap-2 w-full sm:w-auto text-xs"
            >
              View Patient Schedule <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardBody>
      </Card>

      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <CardTitle>Schedule & Slot Management</CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage consultation availability
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Create new consultation time slots and manage your weekly availability
            schedule.
          </p>
          <Link href="/doctor/schedule">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto text-xs"
            >
              Manage Slot Availability <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

function PatientActions({ onOpenBooking }: { readonly onOpenBooking: () => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarPlus className="size-5" />
            </div>
            <div>
              <CardTitle>Quick Appointment Booking</CardTitle>
              <p className="text-xs text-muted-foreground">
                Lock a consultation slot with concurrency verification.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Select your preferred medical specialist, pick an open time slot, and finalize
            your booking in 3 simple steps.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenBooking}
            className="gap-2 w-full sm:w-auto text-xs"
          >
            Start Booking Wizard <ArrowRight className="size-3.5" />
          </Button>
        </CardBody>
      </Card>

      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <CardTitle>Specialist Directory</CardTitle>
              <p className="text-xs text-muted-foreground">
                Browse board-certified hospital physicians.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Filter physicians by cardiology, neurology, dermatology, pediatrics, and
            experience level.
          </p>
          <Link href="/doctors">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto text-xs"
            >
              Explore Doctors Directory <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const setBookingModalOpen = useUiStore((state) => state.setBookingModalOpen);
  const { user } = useAuth();
  const role = (user?.role || 'PATIENT').toUpperCase();

  const getHeaderInfo = () => {
    if (role === 'ADMIN') {
      return {
        title: 'Hospital Administration Dashboard',
        description:
          'Hospital-wide appointment monitoring, physician management, and audit logs.',
      };
    }
    if (role === 'DOCTOR' || role === 'STAFF') {
      return {
        title: 'Doctor Portal Dashboard',
        description:
          'Manage patient consultations, clinical notes, and schedule availability.',
      };
    }
    return {
      title: 'Patient Portal Dashboard',
      description:
        'Overview of your booked consultations, specialist directory, and quick booking.',
    };
  };

  const { title, description } = getHeaderInfo();

  const renderRoleActions = () => {
    if (role === 'ADMIN') {
      return <AdminActions />;
    }
    if (role === 'DOCTOR' || role === 'STAFF') {
      return <DoctorActions />;
    }
    return <PatientActions onOpenBooking={() => setBookingModalOpen(true)} />;
  };

  return (
    <Page>
      <PageHeader title={title} description={description} />

      <DashboardStats />

      {renderRoleActions()}

      <BookingWizardModal />
    </Page>
  );
}
