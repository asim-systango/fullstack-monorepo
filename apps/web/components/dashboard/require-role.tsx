'use client';

import { useEffect, type ReactElement, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Alert, Button, LoadingState } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { hasRole, type UserRole } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';

export function RequireRole({
  allowed,
  children,
}: Readonly<{ allowed: readonly UserRole[]; children: ReactNode }>): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const params = new URLSearchParams({ next: pathname || ROUTES.dashboard });
      router.replace(`${ROUTES.login}?${params.toString()}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingState variant="block" label="Loading session…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingState variant="block" label="Redirecting…" />
      </div>
    );
  }

  if (!hasRole(user, allowed)) {
    return (
      <div className="mx-auto max-w-lg py-10">
        <Alert tone="danger" title="Access denied">
          You do not have permission to view this area. If you believe this is a mistake,
          contact a library administrator.
        </Alert>
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.replace(ROUTES.dashboard)}
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
