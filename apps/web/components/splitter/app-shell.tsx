'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@shared/ui/components';
import {
  IconActivity,
  IconBalances,
  IconChevronRight,
  IconFriends,
  IconGroups,
  IconHelp,
  IconMenu,
  IconSettings,
  IconSettlements,
  IconSun,
} from './icons';
import { UserMenu } from './user-menu';

const PRIMARY_NAV = [
  { href: '/groups', label: 'Groups', icon: IconGroups },
  { href: '/balances', label: 'Balances', icon: IconBalances },
  { href: '/settlements', label: 'Settlements', icon: IconSettlements },
  { href: '/activity', label: 'Activity', icon: IconActivity },
  { href: '/friends', label: 'Friends', icon: IconFriends },
] as const;

const SECONDARY_NAV = [
  { href: '/account', label: 'Settings', icon: IconSettings },
  { href: '/help', label: 'Help & Support', icon: IconHelp },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/groups') {
    return pathname === '/groups' || pathname.startsWith('/groups/');
  }
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  if (href === '/account') {
    return pathname === '/account' || pathname.startsWith('/account/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/groups/') && pathname.includes('/expenses/'))
    return 'Expense';
  if (pathname.startsWith('/groups/') && pathname.endsWith('/balances'))
    return 'Balances';
  if (pathname.startsWith('/groups/') && pathname !== '/groups') return 'Group';
  if (pathname.startsWith('/groups')) return 'Groups';
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/expenses')) return 'Expenses';
  if (pathname.startsWith('/balances')) return 'Balances';
  if (pathname.startsWith('/settlements')) return 'Settlements';
  if (pathname.startsWith('/activity')) return 'Activity';
  if (pathname.startsWith('/friends')) return 'Friends';
  if (pathname.startsWith('/account')) return 'Settings';
  if (pathname.startsWith('/help')) return 'Help & Support';
  return 'Splitter';
}

function SidebarNav({ onNavigate }: Readonly<{ onNavigate?: () => void }>) {
  const pathname = usePathname();

  return (
    <>
      <Link href="/groups" className="splitter-sidebar-brand" onClick={onNavigate}>
        <span className="splitter-mark" aria-hidden>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path
              d="M7 8.5h10M7 15.5h10M9.5 8.5v7M14.5 8.5v7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="splitter-sidebar-brand-text">SPLITTER</span>
      </Link>

      <nav className="splitter-nav" aria-label="Main">
        {PRIMARY_NAV.map((item) => {
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

      <div className="splitter-sidebar-foot">
        <nav className="splitter-nav-secondary" aria-label="Secondary">
          {SECONDARY_NAV.map((item) => {
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

        <button type="button" className="splitter-appearance" aria-label="Appearance">
          <IconSun />
          <span className="flex-1 text-left">Light mode</span>
          <IconChevronRight />
        </button>
      </div>
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
          <div className="splitter-content-frame splitter-topbar-inner">
            <div className="flex min-w-0 items-center gap-3">
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
              <h1 className="splitter-topbar-title">{pageTitle(pathname)}</h1>
            </div>
            <UserMenu />
          </div>
        </header>
        <main className="splitter-main">
          <div className="splitter-content-frame">{children}</div>
        </main>
      </div>
    </div>
  );
}
