'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingState } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { isPublicCatalogPath, ROUTES } from '@/lib/auth/routes';
import { DashboardShell } from './dashboard-shell';
import { GuestCatalogShell } from './guest-catalog-shell';

export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const publicCatalog = isPublicCatalogPath(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicCatalog) {
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
  }, [isAuthenticated, isLoading, pathname, publicCatalog, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingState variant="block" label="Loading session…" />
      </div>
    );
  }

  if (!user) {
    if (publicCatalog) {
      return <GuestCatalogShell>{children}</GuestCatalogShell>;
    }
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
