'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Badge } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { Avatar } from './avatar';
import { IconAccount, IconChevron, IconLogout } from './icons';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  async function onLogout() {
    setOpen(false);
    await logout();
    router.push('/login');
  }

  return (
    <div className="splitter-menu" ref={rootRef}>
      <button
        type="button"
        className="splitter-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar name={user.name} size="md" />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-semibold leading-tight">
            {user.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </span>
        <IconChevron className="hidden text-muted-foreground sm:block" />
        <span className="sr-only">Open account menu</span>
      </button>

      {open ? (
        <div id={menuId} role="menu" className="splitter-menu-panel">
          <div className="flex items-start gap-3 border-b border-border px-3 py-3">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-1.5">
                <Badge tone="accent">{user.role}</Badge>
              </div>
            </div>
          </div>
          <Link
            href="/account"
            role="menuitem"
            className="splitter-menu-link"
            onClick={() => setOpen(false)}
          >
            <IconAccount />
            Account details
          </Link>
          <button
            type="button"
            role="menuitem"
            className="splitter-menu-btn"
            onClick={() => void onLogout()}
          >
            <IconLogout />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
