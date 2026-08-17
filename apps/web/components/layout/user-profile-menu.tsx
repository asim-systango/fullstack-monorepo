'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useAuth } from '../auth';

function initialsFor(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserProfileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  if (!user) return null;

  async function onLogout() {
    setPending(true);
    try {
      await logout();
      queryClient.clear();
      setOpen(false);
      router.push('/login');
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={containerRef} className="ui-user-menu">
      <button
        type="button"
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="ui-user-menu-trigger"
      >
        <span aria-hidden="true" className="ui-user-menu-avatar">
          {initialsFor(user.name, user.email)}
        </span>
      </button>

      {open ? (
        <div role="menu" aria-label="User menu" className="ui-user-menu-panel">
          <div className="ui-user-menu-identity">
            <p className="ui-user-menu-name">{user.name || user.email}</p>
            <p className="ui-user-menu-email">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            onClick={() => void onLogout()}
            className="ui-user-menu-item"
          >
            <LogOut aria-hidden="true" size={16} />
            {pending ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
