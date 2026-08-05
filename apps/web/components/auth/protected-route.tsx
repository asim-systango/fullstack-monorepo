'use client';

import { useAuth } from '@/components/auth';
import { LoadingState } from '@shared/ui/components';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

/**
 * Client-side route protection wrapper.
 * Redirects to /login if no authenticated session exists.
 */
export function ProtectedRoute({ children }: Readonly<{ children: ReactNode }>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingState label="Checking authentication…" />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
