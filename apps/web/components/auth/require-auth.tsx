'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { User } from '@shared/api-client';
import { Alert, LoadingState, Page } from '@shared/ui/components';
import { useAuth } from './auth-provider';
import { ShellHeader } from './shell-header';

export type Role = User['role'];

export function RequireAuth({
  children,
  roles,
}: Readonly<{
  children: ReactNode;
  roles?: readonly Role[];
}>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <Page>
        <ShellHeader title="Loading" />
        <LoadingState label="Checking session…" />
      </Page>
    );
  }

  if (!user) {
    return (
      <Page>
        <ShellHeader title="Sign in required" />
        <Alert tone="info" title="You need to sign in">
          <p className="mb-3">This page is only available to signed-in users.</p>
          <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Go to log in</Link>
        </Alert>
      </Page>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Page>
        <ShellHeader title="Access denied" />
        <Alert tone="danger" title="You do not have access">
          <p>
            Your role ({user.role}) cannot open this page.
            {roles.length === 1 ? ` Required role: ${roles[0]}.` : null}
          </p>
          <p className="mt-3">
            <Link href="/auctions">Back to auctions</Link>
          </p>
        </Alert>
      </Page>
    );
  }

  return <>{children}</>;
}

export function RoleGate({
  children,
  roles,
}: Readonly<{
  children: ReactNode;
  roles: readonly Role[];
}>) {
  return <RequireAuth roles={roles}>{children}</RequireAuth>;
}
