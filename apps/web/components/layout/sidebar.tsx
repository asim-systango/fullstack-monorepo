'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth';
import { Button } from '@shared/ui/components';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

/** Role-based navigation configuration. */
const NAV_CONFIG: Record<string, NavItem[]> = {
  user: [
    { label: 'Doctors', href: '/doctors', icon: '🩺' },
    { label: 'Appointments', href: '/appointments', icon: '📅' },
  ],
  staff: [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Schedule', href: '/doctor/schedule', icon: '🗓️' },
    { label: 'Appointments', href: '/appointments', icon: '📅' },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Doctors', href: '/doctors', icon: '🩺' },
    { label: 'Appointments', href: '/appointments', icon: '📅' },
    { label: 'Admin', href: '/admin', icon: '⚙️' },
  ],
};

const DEFAULT_NAV: NavItem[] = [
  { label: 'Doctors', href: '/doctors', icon: '🩺' },
  { label: 'Appointments', href: '/appointments', icon: '📅' },
];

/**
 * Responsive sidebar with role-based navigation.
 * Collapsed on mobile, expanded on desktop.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role ?? 'user';
  const navItems = NAV_CONFIG[role] ?? DEFAULT_NAV;

  return (
    <>
      {/* Mobile toggle */}
      <Button
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? '✕' : '☰'}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r
          border-border bg-background transition-transform duration-200
          md:static md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background font-bold text-sm">
            ✚
          </span>
          <Link
            href="/"
            className="text-lg font-bold text-foreground tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            PulseCare
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                      transition-colors
                      ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            Role: <span className="font-medium capitalize">{role}</span>
          </p>
        </div>
      </aside>
    </>
  );
}
