'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopHeader } from './top-header';

type AppShellProps = Readonly<{
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}>;

export function AppShell({ title, subtitle, headerActions, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader title={title} subtitle={subtitle} actions={headerActions} />
        <div className="p-8 space-y-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
