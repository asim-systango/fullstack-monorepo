'use client';

import Link from 'next/link';
import { ShellHeader } from '@/components/auth';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/components/auth';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleQuickLogin = async (email: string, role: string) => {
    setLoadingRole(role);
    try {
      await authApi.login({ email, password: 'password123' });
      await refresh();
      router.push('/dashboard');
    } catch {
      router.push('/login');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ShellHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border py-24 px-6 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-foreground mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Next-Generation Hospital & Appointment Platform
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Precision Healthcare. <br />
            <span className="bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
              Effortless Booking.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            PulseCare connects patients with world-class medical specialists through
            real-time, transactionally secured slot scheduling and integrated health
            records.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/doctors"
              className="rounded-lg bg-foreground px-6 py-3.5 text-sm font-semibold text-background shadow-lg transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              Book an Appointment
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-muted/20 py-12 px-6">
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

      {/* Quick Demo Access Section */}
      <section className="border-b border-border py-20 px-6 bg-background">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              1-Click Demo Portals
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Instantly test role-based access for Patients, Doctors, and Admins.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Patient Preset */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-foreground/40">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <h3 className="font-semibold text-foreground">Patient Portal</h3>
                  <p className="text-xs text-muted-foreground">user@demo.local</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Browse specialist directory, view open consultation slots, and manage
                personal bookings.
              </p>
              <button
                type="button"
                onClick={() => void handleQuickLogin('user@demo.local', 'Patient')}
                disabled={loadingRole !== null}
                className="mt-6 w-full rounded-md border border-border bg-background py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {loadingRole === 'Patient' ? 'Authenticating…' : 'Enter as Patient →'}
              </button>
            </div>

            {/* Doctor Preset */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-foreground/40">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🩺</span>
                <div>
                  <h3 className="font-semibold text-foreground">Doctor Portal</h3>
                  <p className="text-xs text-muted-foreground">staff@demo.local</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Manage consultation schedules, issue prescriptions, and record clinical
                medical notes.
              </p>
              <button
                type="button"
                onClick={() => void handleQuickLogin('staff@demo.local', 'Doctor')}
                disabled={loadingRole !== null}
                className="mt-6 w-full rounded-md border border-border bg-background py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {loadingRole === 'Doctor' ? 'Authenticating…' : 'Enter as Doctor →'}
              </button>
            </div>

            {/* Admin Preset */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-foreground/40">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="font-semibold text-foreground">Hospital Admin</h3>
                  <p className="text-xs text-muted-foreground">admin@demo.local</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Oversee hospital operations, manage practitioner profiles, and monitor
                system analytics.
              </p>
              <button
                type="button"
                onClick={() => void handleQuickLogin('admin@demo.local', 'Admin')}
                disabled={loadingRole !== null}
                className="mt-6 w-full rounded-md border border-border bg-background py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {loadingRole === 'Admin' ? 'Authenticating…' : 'Enter as Admin →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-6 border-b border-border bg-muted/10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">
              Engineered for Healthcare Excellence
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Built on modern monorepo architecture with clean separation of concerns.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mb-4">
                🩺
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Specialist Management
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Filter medical practitioners by specialization, qualification, experience,
                and consultation fees.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mb-4">
                🔒
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Concurrency Slot Locking
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Pessimistic database locking prevents double bookings during high-demand
                appointment windows.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mb-4">
                📄
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Digital Prescriptions
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Structured JSONB medicine records with dosage, frequency, and instructions
                attached to appointments.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mb-4">
                📝
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Clinical Medical Notes
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Private consultation records authored by attending physicians with full
                audit history.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mb-4">
                🛡️
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Enterprise Security
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                HttpOnly JWT cookie authorization at the gateway tier and strict RBAC
                authorization across services.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mb-4">
                ⚡
              </div>
              <h3 className="text-base font-semibold text-foreground">
                High-Performance Stack
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Powered by Next.js App Router, NestJS microservices, TypeORM PostgreSQL,
                and Redis caching.
              </p>
            </div>
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
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
