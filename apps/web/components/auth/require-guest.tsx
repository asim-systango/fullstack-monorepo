'use client';

import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@shared/ui/components';
import { useAuth } from './auth-provider';
import { AuthLayout } from './auth-layout';
import { ROUTES } from '@/lib/auth/routes';
import { getSafeNextPath } from '@/lib/auth/safe-next';

/**
 * Blocks auth forms until session resolution finishes, then redirects
 * authenticated users away from guest-only pages.
 */
export function RequireGuest({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getSafeNextPath(searchParams.get('next'), ROUTES.dashboard));
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <AuthLayout title="Checking session" subtitle="Please wait…">
        <div className="auth-form-body py-8">
          <LoadingState variant="block" label="Checking session…" />
        </div>
      </AuthLayout>
    );
  }

  if (isAuthenticated) {
    return (
      <AuthLayout title="Redirecting" subtitle="Taking you to your dashboard…">
        <div className="auth-form-body py-8">
          <LoadingState variant="block" label="Redirecting…" />
        </div>
      </AuthLayout>
    );
  }

  return <>{children}</>;
}
