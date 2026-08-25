import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout';

export default function AuthenticatedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
