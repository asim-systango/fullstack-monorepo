'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';
import { pageTitleForPath } from './nav-items';

export function AppHeader({
  menuOpen,
  onMenuClick,
}: Readonly<{ menuOpen: boolean; onMenuClick: () => void }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isMember = hasRole(user, [ROLES.user]);
  const isStaff = hasRole(user, [ROLES.staff]);
  const isAdmin = hasRole(user, [ROLES.admin]);
  const [menuOpenLocal, setMenuOpenLocal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpenLocal(false);
      }
    }
    if (menuOpenLocal) {
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }
  }, [menuOpenLocal]);

  async function onLogout() {
    setMenuOpenLocal(false);
    await logout();
    router.replace(ROUTES.login);
    router.refresh();
  }

  const title = pageTitleForPath(pathname);

  if (isStaff) {
    return (
      <header className="staff-header flex min-h-[4.5rem] items-center justify-between gap-3 border-b px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            aria-label="Open menu"
          >
            Menu
          </Button>
          <p className="m-0 text-sm font-semibold tracking-tight text-[color:var(--bookly-navy)]">
            {title}
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={menuOpenLocal}
            aria-haspopup="menu"
            onClick={() => setMenuOpenLocal((open) => !open)}
          >
            <span className="flex flex-col items-start leading-tight">
              <span>{user?.name ?? 'Account'}</span>
              <span className="text-[0.65rem] font-normal text-muted-foreground">
                Staff
              </span>
            </span>
          </Button>
          {menuOpenLocal ? (
            <div className="staff-user-menu" role="menu" aria-label="Account menu">
              <Link
                href={ROUTES.changePassword}
                role="menuitem"
                onClick={() => setMenuOpenLocal(false)}
              >
                Change password
              </Link>
              <button type="button" role="menuitem" onClick={() => void onLogout()}>
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </header>
    );
  }

  if (isAdmin) {
    return (
      <header className="admin-header flex min-h-[4.5rem] items-center justify-between gap-3 border-b px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            aria-label="Open menu"
          >
            Menu
          </Button>
          <p className="m-0 text-sm font-semibold tracking-tight text-[color:var(--bookly-navy)]">
            {title}
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={menuOpenLocal}
            aria-haspopup="menu"
            onClick={() => setMenuOpenLocal((open) => !open)}
          >
            <span className="flex flex-col items-start leading-tight">
              <span>{user?.name ?? 'Account'}</span>
              <span className="text-[0.65rem] font-normal text-muted-foreground">
                Administrator
              </span>
            </span>
          </Button>
          {menuOpenLocal ? (
            <div className="admin-user-menu" role="menu" aria-label="Account menu">
              <Link
                href={ROUTES.changePassword}
                role="menuitem"
                onClick={() => setMenuOpenLocal(false)}
              >
                Change password
              </Link>
              <button type="button" role="menuitem" onClick={() => void onLogout()}>
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </header>
    );
  }

  if (!isMember) {
    return (
      <header className="flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-border bg-background px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuClick}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            aria-label="Open menu"
          >
            Menu
          </Button>
          <p className="m-0 text-sm font-medium">{title}</p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              {user.name} · {user.role}
            </span>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => void onLogout()}>
            Log out
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="member-header flex min-h-[4.5rem] items-center justify-between gap-3 border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuClick}
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          aria-label="Open menu"
        >
          Menu
        </Button>
        <p className="m-0 text-sm font-semibold tracking-tight text-[color:var(--bookly-navy)]">
          {title}
        </p>
      </div>

      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={menuOpenLocal}
          aria-haspopup="menu"
          onClick={() => setMenuOpenLocal((open) => !open)}
        >
          {user?.name ?? 'Account'}
        </Button>
        {menuOpenLocal ? (
          <div className="member-user-menu" role="menu" aria-label="Account menu">
            <Link
              href={ROUTES.profile}
              role="menuitem"
              onClick={() => setMenuOpenLocal(false)}
            >
              Profile
            </Link>
            <Link
              href={ROUTES.changePassword}
              role="menuitem"
              onClick={() => setMenuOpenLocal(false)}
            >
              Change password
            </Link>
            <button type="button" role="menuitem" onClick={() => void onLogout()}>
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
