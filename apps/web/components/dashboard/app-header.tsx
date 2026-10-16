'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Button,
} from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { MemberAccountMenu } from '@/components/member/account-menu';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';
import { ConfirmDialog } from './confirm-dialog';
import { pageTitleForPath } from './nav-items';

function HeaderMenuButton({
  hidden,
  menuOpen,
  onMenuClick,
}: Readonly<{ hidden: boolean; menuOpen: boolean; onMenuClick: () => void }>) {
  if (hidden) return null;
  return (
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
  );
}

export function AppHeader({
  menuOpen,
  onMenuClick,
  hideNav = false,
}: Readonly<{ menuOpen: boolean; onMenuClick: () => void; hideNav?: boolean }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isMember = hasRole(user, [ROLES.user]);
  const isStaff = hasRole(user, [ROLES.staff]);
  const isAdmin = hasRole(user, [ROLES.admin]);
  const [menuOpenLocal, setMenuOpenLocal] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

  function requestLogout() {
    setMenuOpenLocal(false);
    setConfirmLogout(true);
  }

  async function onConfirmLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace(ROUTES.login);
      router.refresh();
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  }

  const title = pageTitleForPath(pathname);
  const logoutDialog = (
    <ConfirmDialog
      open={confirmLogout}
      onOpenChange={setConfirmLogout}
      title="Are you sure you want to log out?"
      description="You will need to sign in again to continue."
      confirmLabel="Logout"
      pending={loggingOut}
      pendingText="Logging out…"
      danger
      onConfirm={() => void onConfirmLogout()}
    />
  );

  if (isStaff) {
    return (
      <header className="staff-header flex min-h-[4.5rem] items-center justify-between gap-3 border-b px-4 md:px-6">
        <div className="flex items-center gap-3">
          <HeaderMenuButton hidden={hideNav} menuOpen={menuOpen} onMenuClick={onMenuClick} />
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
              <button type="button" role="menuitem" onClick={requestLogout}>
                Log out
              </button>
            </div>
          ) : null}
        </div>
        {logoutDialog}
      </header>
    );
  }

  if (isAdmin) {
    return (
      <header className="admin-header flex min-h-[4.5rem] items-center justify-between gap-3 border-b px-4 md:px-6">
        <div className="flex items-center gap-3">
          <HeaderMenuButton hidden={hideNav} menuOpen={menuOpen} onMenuClick={onMenuClick} />
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
              <button type="button" role="menuitem" onClick={requestLogout}>
                Log out
              </button>
            </div>
          ) : null}
        </div>
        {logoutDialog}
      </header>
    );
  }

  if (!isMember) {
    return (
      <header className="flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-border bg-background px-4 md:px-6">
        <div className="flex items-center gap-3">
          <HeaderMenuButton hidden={hideNav} menuOpen={menuOpen} onMenuClick={onMenuClick} />
          <p className="m-0 text-sm font-medium">{title}</p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              {user.name} · {user.role}
            </span>
          ) : null}
          <Button variant="ghost" size="sm" onClick={requestLogout}>
            Log out
          </Button>
        </div>
        {logoutDialog}
      </header>
    );
  }

  return (
    <header className="member-header flex min-h-[4.5rem] items-center justify-between gap-3 border-b px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <HeaderMenuButton hidden={hideNav} menuOpen={menuOpen} onMenuClick={onMenuClick} />
        <p className="member-header-title truncate">{title}</p>
      </div>
      <MemberAccountMenu hideProfile={hideNav} />
    </header>
  );
}
