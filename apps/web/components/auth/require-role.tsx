'use client';

import { LoadingState } from '@shared/ui/components';
import { useAuth } from './auth-provider';
import { AccessDenied } from './access-denied';
import { AppShell } from '@/components/layout';
import type { User } from '@shared/api-client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type RequireRoleProps = Readonly<{
  roles: readonly User['role'][];
  children: ReactNode;
}>;

export function RequireRole({ roles, children }: RequireRoleProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const returnTo = encodeURIComponent(window.location.pathname);
      router.replace(`/login?returnTo=${returnTo}`);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <AppShell>
        <LoadingState label="Checking access…" />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <LoadingState label="Redirecting to login…" />
      </AppShell>
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <AppShell>
        <AccessDenied />
      </AppShell>
    );
  }

  return <>{children}</>;
}
