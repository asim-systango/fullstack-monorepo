'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { Avatar } from './avatar';
import { IconActivity, IconAccount, IconGroups, IconMenu } from './icons';
import { UserMenu } from './user-menu';

const NAV = [
  { href: '/groups', label: 'Groups', icon: IconGroups },
  { href: '/activity', label: 'Activity', icon: IconActivity },
  { href: '/account', label: 'Account', icon: IconAccount },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/groups') {
    return pathname === '/groups' || pathname.startsWith('/groups/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/groups/') && pathname.endsWith('/balances'))
    return 'Balances';
  if (pathname.startsWith('/groups/') && pathname !== '/groups') return 'Group';
  if (pathname.startsWith('/groups')) return 'Groups';
  if (pathname.startsWith('/activity')) return 'Activity';
  if (pathname.startsWith('/account')) return 'Account';
  return 'Splitter';
}

function SidebarNav({ onNavigate }: Readonly<{ onNavigate?: () => void }>) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      <Link href="/groups" className="splitter-sidebar-brand" onClick={onNavigate}>
        <span className="splitter-mark">S</span>
        <span>
          <span className="block text-base font-bold leading-tight">Splitter</span>
          <span className="block text-xs font-normal opacity-70">Shared expenses</span>
        </span>
      </Link>

      <nav className="splitter-nav" aria-label="Main">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          const className = active
            ? 'splitter-nav-item splitter-nav-item-active'
            : 'splitter-nav-item';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
              onClick={onNavigate}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user ? (
        <div className="splitter-sidebar-foot">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-lg px-1 py-1 text-inherit no-underline hover:no-underline"
            onClick={onNavigate}
          >
            <Avatar name={user.name} size="md" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs opacity-70">{user.email}</span>
            </span>
          </Link>
        </div>
      ) : null}
    </>
  );
}

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="splitter-shell">
      <aside className="splitter-sidebar">
        <SidebarNav />
      </aside>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="splitter-sidebar-scrim md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="splitter-sidebar-mobile md:hidden"
            aria-label="Mobile navigation"
          >
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="splitter-topbar sticky top-0 z-20">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <IconMenu />
            </Button>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Splitter
              </p>
              <h1 className="text-base font-semibold leading-tight">
                {pageTitle(pathname)}
              </h1>
            </div>
          </div>
          <UserMenu />
        </header>
        <main className="splitter-main mx-auto w-full max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
