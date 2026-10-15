'use client';

import type { ReactNode } from 'react';
import type { User } from '@shared/api-client';
import { Alert, LoadingState } from '@shared/ui/components';
import { useAuth } from './auth-provider';

type Role = User['role'];

export function RequireAuth({
  role,
  children,
}: Readonly<{
  role?: Role | Role[];
  children: ReactNode;
}>) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Checking session…" />;
  }

  if (!user) {
    return (
      <Alert tone="danger" title="Sign in required">
        Please log in to continue.
      </Alert>
    );
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return (
        <Alert tone="danger" title="Access denied">
          You do not have permission to view this page.
        </Alert>
      );
    }
  }

  return <>{children}</>;
}
