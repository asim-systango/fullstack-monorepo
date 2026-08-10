'use client';

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
import { CalendarPlus, Stethoscope, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const setBookingModalOpen = useUiStore((state) => state.setBookingModalOpen);

  return (
    <Page>
      <PageHeader
        title="Patient & Clinical Portal Dashboard"
        description="Overview of appointments, medical specialists, and booking actions."
      />

      <DashboardStats />

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
              Select your preferred medical specialist, pick an open time slot, and
              finalize your booking in 3 simple steps.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setBookingModalOpen(true)}
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

      <BookingWizardModal />
    </Page>
  );
}
