'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { Button } from '@shared/ui/components';

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-muted-foreground">…</span>;
  }

  if (user) {
    return (
      <>
        <span className="font-mono text-xs text-muted-foreground">
          {user.name} · {user.role}
        </span>
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          Log out
        </Button>
      </>
    );
  }

  return (
    <>
      <Link href="/login">Log in</Link>
      <Link
        href="/register"
        className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
      >
        Register
      </Link>
    </>
  );
}

function MainNav() {
  const { user } = useAuth();

  return (
    <>
      <Link href="/">Home</Link>
      {user && (
        <>
          <Link href="/tickets">My Tickets</Link>
          {(user.role === 'staff' || user.role === 'admin') && (
            <Link href="/agent">Agent Inbox</Link>
          )}
          {user.role === 'admin' && <Link href="/categories">Categories</Link>}
        </>
      )}
      <Link href="/ui">UI kit</Link>
    </>
  );
}

export function ShellHeader({
  title,
  subtitle = 'Support Desk Management',
}: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <header className="ui-shell-header">
      <div>
        <h1 className="ui-shell-title">{title}</h1>
        <p className="ui-shell-subtitle">{subtitle}</p>
      </div>
      <nav className="ui-shell-nav">
        <MainNav />
        <AuthNav />
      </nav>
    </header>
  );
}
