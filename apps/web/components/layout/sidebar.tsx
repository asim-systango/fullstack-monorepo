'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  LayoutDashboard,
  CalendarDays,
  Settings,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import { Button } from '@shared/ui/components';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const PATIENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  { label: 'Appointments', href: '/appointments', icon: Calendar },
];

const DOCTOR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Schedule', href: '/doctor/schedule', icon: CalendarDays },
  { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { label: 'Admin Panel', href: '/admin', icon: Settings },
];

/** Role-based navigation configuration. */
const NAV_CONFIG: Record<string, NavItem[]> = {
  PATIENT: PATIENT_NAV,
  DOCTOR: DOCTOR_NAV,
  ADMIN: ADMIN_NAV,
  patient: PATIENT_NAV,
  user: PATIENT_NAV,
  doctor: DOCTOR_NAV,
  staff: DOCTOR_NAV,
  admin: ADMIN_NAV,
};

const DEFAULT_NAV: NavItem[] = PATIENT_NAV;

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role ? String(user.role).toUpperCase() : 'PATIENT';
  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG[user?.role ?? 'PATIENT'] ?? DEFAULT_NAV;

  return (
    <>
      {/* Mobile toggle */}
      <Button
        size="icon"
        variant="outline"
        className="fixed left-4 top-3 z-50 md:hidden shadow-md rounded-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r
          border-border/80 bg-card/90 backdrop-blur-xl transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 shadow-sm
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-border/80 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm ring-2 ring-primary/20">
            <Activity className="size-5 animate-pulse" />
          </div>
          <Link href="/" className="flex flex-col" onClick={() => setMobileOpen(false)}>
            <span className="text-base font-bold text-foreground tracking-tight leading-none">
              PulseCare
            </span>
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider">
              HEALTHCARE MANAGEMENT
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
            <span>Navigation Menu</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
              {role}
            </span>
          </div>
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs ring-1 ring-primary/30'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon
                      className={`size-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                    />
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border/80 px-4 py-3.5 bg-muted/20 text-center">
          <p className="text-[11px] font-mono text-muted-foreground">
            PulseCare v1.0.0 &bull; Healthcare Portal
          </p>
        </div>
      </aside>
    </>
  );
}
