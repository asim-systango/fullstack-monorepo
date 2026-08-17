import { Suspense, type ReactNode } from 'react';
import { AuthPageFallback, RequireGuest } from '@/components/auth';

export default function AuthGroupLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense fallback={<AuthPageFallback title="Loading" />}>
      <RequireGuest>{children}</RequireGuest>
    </Suspense>
  );
}
