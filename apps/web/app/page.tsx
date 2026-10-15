'use client';

import Link from 'next/link';
import { ShellHeader } from '@/components/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth';
import { useEffect } from 'react';
import {
  Stethoscope,
  Lock,
  FileText,
  ClipboardList,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button, Card, LoadingState } from '@shared/ui/components';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState label="Redirecting to dashboard…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ShellHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80 py-20 px-6 md:py-28 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-foreground mb-8 shadow-xs backdrop-blur-xs">
            <Sparkles className="size-3.5 text-amber-500 animate-pulse" />
            Next-Generation Hospital & Appointment Platform
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight">
            Precision Healthcare. <br />
            <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
              Effortless Booking.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            PulseCare connects patients with world-class medical specialists through
            real-time, transactionally secured slot scheduling and integrated health
            records.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/doctors">
              <Button size="lg" variant="primary" className="gap-2">
                Book an Appointment <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card/50 py-12 px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground sm:text-4xl">150+</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Specialist Doctors
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground sm:text-4xl">99.9%</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Schedule Accuracy
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground sm:text-4xl">24/7</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Emergency Services
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground sm:text-4xl">50,000+</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Patients Cared For
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 border-b border-border bg-muted/10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              Engineered for Healthcare Excellence
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Built on modern monorepo architecture with clean separation of concerns.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4 shadow-xs">
                <Stethoscope className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Specialist Management
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Filter medical practitioners by specialization, qualification, experience,
                and consultation fees.
              </p>
            </Card>

            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4 shadow-xs">
                <Lock className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Concurrency Slot Locking
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Pessimistic database locking prevents double bookings during high-demand
                appointment windows.
              </p>
            </Card>

            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4 shadow-xs">
                <FileText className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Digital Prescriptions
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Structured JSONB medicine records with dosage, frequency, and instructions
                attached to appointments.
              </p>
            </Card>

            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4 shadow-xs">
                <ClipboardList className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Clinical Medical Notes
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Private consultation records authored by attending physicians with full
                audit history.
              </p>
            </Card>

            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4 shadow-xs">
                <Shield className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Enterprise Security
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                HttpOnly JWT cookie authorization at the gateway tier and strict RBAC
                authorization across services.
              </p>
            </Card>

            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4 shadow-xs">
                <Zap className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                High-Performance Stack
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Powered by Next.js App Router, NestJS microservices, TypeORM PostgreSQL,
                and Redis caching.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-6 bg-card text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">PulseCare Hospital System</span>
            <span>© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              API Gateway Operational
            </span>
            <Link href="/doctors" className="hover:text-foreground">
              Doctors
            </Link>
            <Link href="/appointments" className="hover:text-foreground">
              Appointments
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
