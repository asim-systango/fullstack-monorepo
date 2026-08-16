'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingState } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { ROUTES } from '@/lib/auth/routes';
import { DashboardShell } from './dashboard-shell';

export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const params = new URLSearchParams({ next: pathname || ROUTES.dashboard });
      router.replace(`${ROUTES.login}?${params.toString()}`);
      return;
    }
    if (
      !isLoading &&
      isAuthenticated &&
      user?.mustChangePassword &&
      pathname !== ROUTES.changePassword
    ) {
      router.replace(ROUTES.changePassword);
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingState variant="block" label="Loading session…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingState variant="block" label="Redirecting…" />
      </div>
    );
  }

  if (user.mustChangePassword && pathname !== ROUTES.changePassword) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingState variant="block" label="Redirecting…" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
