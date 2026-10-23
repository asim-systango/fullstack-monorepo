import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout';

// (app) is a route group: it adds this layout without changing the urls
export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
