'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth';
import { ROUTES } from '@/lib/auth/routes';

export function HomeAuthLinks() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="mt-4 text-sm text-muted-foreground">Checking session…</p>;
  }

  if (user) {
    return (
      <p className="mt-4">
        Signed in as {user.name}. <Link href={ROUTES.dashboard}>Go to dashboard</Link>
      </p>
    );
  }

  return (
    <p className="mt-4">
      <Link href={ROUTES.login}>Log in</Link> or{' '}
      <Link href={ROUTES.register}>register</Link> to open the dashboard.
    </p>
  );
}
