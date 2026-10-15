'use client';

import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

/**
 * Dashboard layout wrapping all protected routes.
 * Renders sidebar + header + main content area.
 */
export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
