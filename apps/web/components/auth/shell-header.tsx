'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { UserRole } from '@/lib/auth/roles';
import { Badge, Button } from '@shared/ui';

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-zinc-500">…</span>;
  }

  if (user) {
    const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;
    return (
      <div className="flex items-center space-x-3">
        <span className="text-xs text-zinc-350 font-medium">{userName}</span>
        <Badge tone={user.role === UserRole.SUPER_ADMIN ? 'accent' : 'neutral'}>
          {user.role || 'Member'}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          Log out
        </Button>
      </div>
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
