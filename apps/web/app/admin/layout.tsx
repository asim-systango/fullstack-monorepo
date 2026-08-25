'use client';

import { RequireRole } from '@/components/auth';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RequireRole roles={['admin']}>{children}</RequireRole>;
}
