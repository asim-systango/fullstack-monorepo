'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Badge, Button, Spinner } from '@shared/ui/components';

function roleLabel(role: string) {
  if (role === 'staff') return 'project lead';
  if (role === 'admin') return 'admin';
  return 'member';
}

function NavLink({
  href,
  label,
  pathname,
}: Readonly<{ href: string; label: string; pathname: string }>) {
  const active =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className="tf-shell-nav-link"
      data-active={active ? 'true' : 'false'}
    >
      {label}
    </Link>
  );
}

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <Spinner size="sm" label="Checking session" />;
  }

  if (user) {
    return (
      <div className="tf-shell-user">
        <span className="tf-shell-user-meta">
          <span className="tf-shell-user-name">{user.name}</span>
          <Badge tone="accent">{roleLabel(user.role)}</Badge>
        </span>
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          Log out
        </Button>
      </div>
    );
  }

  return (
    <div className="tf-shell-user">
      <Link href="/login" className="tf-shell-nav-link">
        Log in
      </Link>
      <Link
        href="/register"
        className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
      >
        Register
      </Link>
    </div>
  );
}

function HeaderBrandMark() {
  return (
    <svg
      className="tf-shell-brand-art"
      viewBox="0 0 160 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        className="tf-shell-brand-art-card"
        x="4"
        y="6"
        width="42"
        height="24"
        rx="7"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <rect
        className="tf-shell-brand-art-float"
        x="12"
        y="13"
        width="26"
        height="5"
        rx="2.5"
        fill="currentColor"
        fillOpacity="0.35"
      />
      <rect
        x="12"
        y="21"
        width="18"
        height="5"
        rx="2.5"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M56 18h28M92 18h28M128 18h24"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        className="tf-shell-brand-art-dot"
        cx="70"
        cy="18"
        r="3.5"
        fill="currentColor"
      />
      <circle cx="106" cy="18" r="3.5" fill="currentColor" fillOpacity="0.45" />
      <circle cx="140" cy="18" r="3.5" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

export function ShellHeader({
  subtitle = 'Projects, issues, and boards',
}: Readonly<{ title?: string; subtitle?: string }>) {
  const { user } = useAuth();
  const pathname = usePathname();
  const canLead = user?.role === 'staff' || user?.role === 'admin';

  return (
    <div className="tf-shell">
      <header className="tf-shell-header">
        <div className="tf-shell-brand-block">
          <Link href="/" className="tf-brand-mark tf-shell-logo">
            <span className="tf-brand-glyph tf-brand-glyph-live">Tf</span>
            <span className="tf-shell-logo-text">
              <span className="tf-shell-logo-name">TaskFlow</span>
              <span className="tf-shell-logo-sub">{subtitle}</span>
            </span>
          </Link>
        </div>

        <div className="tf-shell-center">
          <HeaderBrandMark />
          <nav className="tf-shell-nav" aria-label="Primary">
            <NavLink href="/" label="Home" pathname={pathname} />
            {user ? (
              <>
                <NavLink href="/projects" label="Projects" pathname={pathname} />
                <NavLink href="/dashboard" label="My issues" pathname={pathname} />
              </>
            ) : null}
          </nav>
        </div>

        <div className="tf-shell-end">
          {canLead ? (
            <Link
              href="/projects"
              className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline tf-shell-create"
            >
              + Project
            </Link>
          ) : null}
          <AuthNav />
        </div>
      </header>

      <div className="tf-shell-ribbon" aria-hidden>
        <span className="tf-shell-ribbon-item">Boards</span>
        <span className="tf-shell-ribbon-item">Issues</span>
        <span className="tf-shell-ribbon-item">Members</span>
        <span className="tf-shell-ribbon-item">Live sync</span>
      </div>
    </div>
  );
}
