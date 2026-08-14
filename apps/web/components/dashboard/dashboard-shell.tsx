'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/components/auth';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { AppHeader } from './app-header';
import { Sidebar } from './sidebar';

export function DashboardShell({ children }: Readonly<{ children: ReactNode }>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const isMember = hasRole(user, [ROLES.user]);
  const isStaff = hasRole(user, [ROLES.staff]);
  const isAdmin = hasRole(user, [ROLES.admin]);

  let shellClass = 'bg-background';
  if (isMember) shellClass = 'member-shell';
  else if (isStaff) shellClass = 'staff-shell';
  else if (isAdmin) shellClass = 'admin-shell';

  return (
    <div className={`flex min-h-dvh ${shellClass}`}>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="hidden w-60 shrink-0 md:block" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader menuOpen={menuOpen} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
