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
    const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;
    return (
      <>
        <span className="font-mono text-xs text-muted-foreground">
          {userName} · {user.role || 'Member'}
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

export function ShellHeader({
  title,
  subtitle = 'Systango CRM Platform',
}: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <header className="ui-shell-header">
      <div>
        <h1 className="ui-shell-title">{title}</h1>
        <p className="ui-shell-subtitle">{subtitle}</p>
      </div>
      <nav className="ui-shell-nav">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <AuthNav />
      </nav>
    </header>
  );
}
