'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from './auth-provider';
import { Badge, Button } from '@shared/ui/components';
import type { User } from '@shared/api-client';
import { ButtonLink } from '@/components/ui/button-link';

function roleLabel(role: User['role']): string {
  switch (role) {
    case 'user':
      return 'Bidder';
    case 'staff':
      return 'Seller';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
}

function roleHomeHref(role: User['role']): string {
  switch (role) {
    case 'user':
      return '/my/bids';
    case 'staff':
      return '/seller';
    case 'admin':
      return '/admin/auctions';
    default:
      return '/';
  }
}

function roleHomeLabel(role: User['role']): string {
  switch (role) {
    case 'user':
      return 'My bids';
    case 'staff':
      return 'Seller dashboard';
    case 'admin':
      return 'Admin dashboard';
    default:
      return 'Home';
  }
}

type NavLink = { href: string; label: string };

function guestLinks(): NavLink[] {
  return [
    { href: '/', label: 'Home' },
    { href: '/auctions', label: 'Browse Auctions' },
    { href: '/#categories', label: 'Categories' },
  ];
}

function roleNavLinks(role: User['role']): NavLink[] {
  switch (role) {
    case 'user':
      return [
        { href: '/', label: 'Home' },
        { href: '/auctions', label: 'Browse Auctions' },
        { href: '/#categories', label: 'Categories' },
        { href: '/watchlist', label: 'My Watchlist' },
        { href: '/my/bids', label: 'My Bids' },
      ];
    case 'staff':
      return [
        { href: '/', label: 'Home' },
        { href: '/auctions', label: 'Browse Auctions' },
        { href: '/seller', label: 'My Auctions' },
        { href: '/seller/auctions/new', label: 'Create Auction' },
      ];
    case 'admin':
      return [
        { href: '/', label: 'Home' },
        { href: '/auctions', label: 'Browse Auctions' },
        { href: '/admin/auctions', label: 'Admin Dashboard' },
        { href: '/admin/auctions', label: 'Auction Management' },
      ];
    default:
      return guestLinks();
  }
}

function ProfileMenu({ user }: Readonly<{ user: User }>) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user.name}
      </Button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-48 rounded-md border border-border bg-card p-2 shadow-md"
        >
          <div className="border-b border-border px-2 pb-2 mb-2">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel(user.role)}</p>
          </div>
          <Link
            href={roleHomeHref(user.role)}
            role="menuitem"
            className="block rounded px-2 py-1.5 text-sm text-foreground no-underline hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            {roleHomeLabel(user.role)}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AuthControls() {
  const { user, loading } = useAuth();

  if (loading) {
    return <span className="text-sm text-muted-foreground">…</span>;
  }

  if (user) {
    return (
      <>
        <Badge tone="neutral" className="hidden sm:inline-flex">
          {roleLabel(user.role)}
        </Badge>
        <ProfileMenu user={user} />
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="font-medium">
        Login
      </Link>
      <ButtonLink href="/register" size="sm">
        Register
      </ButtonLink>
    </>
  );
}

function NavLinks({
  links,
  onNavigate,
}: Readonly<{ links: NavLink[]; onNavigate?: () => void }>) {
  return (
    <>
      {links.map((link) => (
        <Link key={`${link.href}-${link.label}`} href={link.href} onClick={onNavigate}>
          {link.label}
        </Link>
      ))}
    </>
  );
}

export function ShellHeader({
  title = 'Auction House',
  subtitle = 'Online Auction House',
}: Readonly<{ title?: string; subtitle?: string }>) {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

  const links = !loading && user ? roleNavLinks(user.role) : guestLinks();

  return (
    <header className="ui-shell-header">
      <div className="min-w-0">
        <Link href="/" className="no-underline hover:no-underline">
          <h1 className="ui-shell-title">{title}</h1>
        </Link>
        <p className="ui-shell-subtitle">{subtitle}</p>
      </div>

      <nav
        className="ui-shell-nav hidden flex-wrap justify-end md:flex"
        aria-label="Main"
      >
        <NavLinks links={links} />
        <AuthControls />
      </nav>

      <div className="md:hidden">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-expanded={mobileOpen}
          aria-controls={menuId}
          onClick={() => setMobileOpen((value) => !value)}
        >
          Menu
        </Button>
      </div>

      {mobileOpen ? (
        <nav
          id={menuId}
          aria-label="Mobile"
          className="basis-full border-t border-border pt-3 md:hidden"
        >
          <div className="flex flex-col gap-3 text-sm">
            <NavLinks links={links} onNavigate={() => setMobileOpen(false)} />
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
              <AuthControls />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
