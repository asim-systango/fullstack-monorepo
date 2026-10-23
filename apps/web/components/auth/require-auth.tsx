'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, LoadingState } from '@shared/ui/components';
import { useAuth } from './auth-provider';
import type { User } from '@shared/api-client';

export function RequireAuth({
  children,
  roles,
}: Readonly<{ children: ReactNode; roles?: User['role'][] }>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingState variant="block" label="Checking session…" />;
  }

  if (!user) {
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Alert tone="danger" title="Access denied">
        Your role ({user.role}) cannot open this page.
      </Alert>
    );
  }

  return <>{children}</>;
}
