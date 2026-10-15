'use client';

import { useAuth } from '@/components/auth';
import { Alert, Page, PageHeader } from '@shared/ui/components';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

type RoleRouteProps = Readonly<{
  /** Allowed gateway roles. */
  roles: string[];
  children: ReactNode;
}>;

/**
 * RBAC route gate.
 * Shows an access-denied message if the user's role is not in the allowed list.
 */
export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  const normalizeRole = (r: string): string => {
    const upper = (r || '').toUpperCase();
    if (upper === 'STAFF') return 'DOCTOR';
    if (upper === 'USER') return 'PATIENT';
    return upper;
  };

  const userRoleNormalized = normalizeRole(user.role);
  const allowedRolesNormalized = roles.map(normalizeRole);

  if (!allowedRolesNormalized.includes(userRoleNormalized)) {
    return (
      <Page>
        <PageHeader title="Access Denied" />
        <Alert tone="danger">
          You do not have permission to access this page. Your role ({user.role}) is not
          authorized for this resource.
        </Alert>
      </Page>
    );
  }

  return <>{children}</>;
}
