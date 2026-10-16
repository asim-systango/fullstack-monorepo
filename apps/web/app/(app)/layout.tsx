import { RequireAuth } from '@/components/dashboard';
import type { ReactNode } from 'react';

export default function AppGroupLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <RequireAuth>{children}</RequireAuth>;
}
