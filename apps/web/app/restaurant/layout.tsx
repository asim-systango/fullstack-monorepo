'use client';

import { RequireRole } from '@/components/auth';

export default function RestaurantLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RequireRole roles={['staff', 'admin']}>{children}</RequireRole>;
}
