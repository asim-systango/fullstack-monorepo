'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { AccessDenied } from '@/components/auth/access-denied';
import {
  getDashboardLabel,
  getDashboardPath,
  getRoleLabel,
  type GatewayRole,
} from '@/lib/auth/roles';
import { useMe } from '@/hooks/use-auth';

type RouteGuardProps = {
  children: ReactNode;
  allowedRoles: GatewayRole[];
  deniedTitle?: string;
  deniedMessage?: string;
};

function isRoleAllowed(role: GatewayRole, allowedRoles: GatewayRole[]): boolean {
  return allowedRoles.includes(role);
}

export function RouteGuard({
  children,
  allowedRoles,
  deniedTitle,
  deniedMessage,
}: Readonly<RouteGuardProps>): ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || user) return;
    // /login owns the sign-in modal and returns here once the session exists.
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isRoleAllowed(user.role, allowedRoles)) {
    const backHref = getDashboardPath(user.role);
    const backLabel = getDashboardLabel(user.role);
    const roleLabel = getRoleLabel(user.role);

    return (
      <AccessDenied
        title={deniedTitle ?? 'Access Denied'}
        message={
          deniedMessage ??
          `${roleLabel} privileges are required for this page. You don't have permission to access it.`
        }
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  return <>{children}</>;
}

export function StudioGuard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RouteGuard
      allowedRoles={['user']}
      deniedMessage="Author Studio is for Authors only."
    >
      {children}
    </RouteGuard>
  );
}

export function EditorGuard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RouteGuard
      allowedRoles={['staff']}
      deniedMessage="Editor privileges are required. You don't have permission to access the Editor Dashboard."
    >
      {children}
    </RouteGuard>
  );
}

export function AdminGuard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RouteGuard
      allowedRoles={['admin']}
      deniedMessage="You don't have permission to access the Admin Dashboard."
    >
      {children}
    </RouteGuard>
  );
}
