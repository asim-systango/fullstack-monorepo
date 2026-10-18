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
      <>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline font-medium text-foreground">
            {user.name}
          </span>
          <Badge tone="accent">{roleLabel(user.role)}</Badge>
        </span>
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          Log out
        </Button>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="tf-shell-nav-link">
        Log in
      </Link>
      <Link
        href="/register"
        className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
      >
        Register
      </Link>
    </>
  );
}

export function ShellHeader({
  subtitle = 'Projects, issues, and boards',
}: Readonly<{ title?: string; subtitle?: string }>) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="tf-shell">
      <header className="ui-shell-header">
        <div>
          <Link href="/" className="tf-brand-mark ui-shell-title">
            <span className="tf-brand-glyph">Tf</span>
            <span>TaskFlow</span>
          </Link>
          <p className="ui-shell-subtitle">{subtitle}</p>
        </div>
        <nav className="ui-shell-nav flex flex-wrap items-center gap-x-4 gap-y-2">
          <NavLink href="/" label="Home" pathname={pathname} />
          {user ? (
            <>
              <NavLink href="/projects" label="Projects" pathname={pathname} />
              <NavLink href="/dashboard" label="My issues" pathname={pathname} />
            </>
          ) : null}
          <AuthNav />
        </nav>
      </header>
    </div>
  );
}
