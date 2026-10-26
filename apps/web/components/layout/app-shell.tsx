'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { User } from '@shared/api-client';
import { Badge, Button, LoadingState, Page } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { NAV_BY_ROLE, ROLE_LABEL, canAccess } from '@/lib/auth/routing';
import { AccessDenied } from './access-denied';

function AppHeader({ user }: Readonly<{ user: User }>) {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="ui-shell-header flex-wrap">
      <div>
        <p className="ui-shell-title">Leave</p>
        <p className="ui-shell-subtitle">Apply, approve and track time off</p>
      </div>
      <nav className="ui-shell-nav flex-wrap" aria-label="Main">
        {NAV_BY_ROLE[user.role].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
            className={pathname === link.href ? 'font-semibold' : undefined}
          >
            {link.label}
          </Link>
        ))}
        <span className="text-xs text-muted-foreground">{user.name}</span>
        <Badge>{ROLE_LABEL[user.role]}</Badge>
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          Log out
        </Button>
      </nav>
    </header>
  );
}

// every page inside app/(app) goes through here: must be logged in, and the role must fit the url
export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <Page>
        <LoadingState variant="block" label="Checking your session…" />
      </Page>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6">
        <AppHeader user={user} />
      </div>
      {canAccess(user.role, pathname) ? children : <AccessDenied role={user.role} />}
    </>
  );
}
