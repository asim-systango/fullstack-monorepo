import type { ReactNode } from 'react';
import { ShellHeader } from '@/components/auth';

export function GuestCatalogShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="member-shell min-h-dvh">
      <ShellHeader title="Bookly" subtitle="Browse the public catalog" />
      <main className="member-main px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
