'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { ROUTES } from '@/lib/auth/routes';

export function MemberAccountMenu({
  hideProfile = false,
}: Readonly<{ hideProfile?: boolean }>) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    if (!menuOpen) return undefined;
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

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

  return (
    <div
      className="relative z-[60]"
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setMenuOpen(false);
        }
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="member-account-btn"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-controls={menuOpen ? menuId : undefined}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span>{user?.name ?? 'Account'}</span>
        <svg
          className={
            menuOpen
              ? 'member-account-chevron member-account-chevron-open'
              : 'member-account-chevron'
          }
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5 L6 8 L9.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>

      {menuOpen ? (
        <div id={menuId} className="member-user-menu" role="menu" aria-label="Account menu">
          {hideProfile ? null : (
            <Link
              href={ROUTES.profile}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          )}
          <Link
            href={ROUTES.changePassword}
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            Change Password
          </Link>
          <button
            type="button"
            role="menuitem"
            className="member-user-menu-danger"
            onClick={() => {
              setMenuOpen(false);
              setConfirmLogout(true);
            }}
          >
            Logout
          </button>
        </div>
      ) : null}

      <Dialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        showClose={false}
      >
        <DialogHeader>
          <DialogTitle>Are you sure you want to log out?</DialogTitle>
          <DialogDescription>
            You will need to sign in again to view your loans, reservations, and fines.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirmLogout(false)}
            disabled={loggingOut}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={loggingOut}
            loadingText="Logging out…"
            onClick={() => void onConfirmLogout()}
          >
            Logout
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
