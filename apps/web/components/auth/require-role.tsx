'use client';

import { useAuth } from './auth-provider';
import { AccessDenied } from './access-denied';
import { AppShell } from '@/components/layout';
import type { User } from '@shared/api-client';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type RequireRoleProps = Readonly<{
  roles: readonly User['role'][];
  children: ReactNode;
}>;

export function RequireRole({ roles, children }: RequireRoleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const returnTo = encodeURIComponent(pathname || '/');
      router.replace(`/login?returnTo=${returnTo}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <output className="tg-page-loading" aria-live="polite" aria-busy="true">
        <span className="tg-api-loading-spinner" aria-hidden />
        <span>Loading…</span>
      </output>
    );
  }

  if (!user) return null;

  if (!roles.includes(user.role)) {
    return (
      <AppShell>
        <AccessDenied />
      </AppShell>
    );
  }

  return <>{children}</>;
}
