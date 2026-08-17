'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Spinner } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/splitter';

export function ProtectedLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const next = window.location.pathname + window.location.search;
    if (!user) {
      router.replace(`/login?returnUrl=${encodeURIComponent(next)}`);
      return;
    }
    if (!user.emailVerified) {
      router.replace('/verify-pending');
    }
  }, [user, loading, router]);

  if (loading || !user || !user.emailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
