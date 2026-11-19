'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { Badge, Button } from '@shared/ui/components';

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-muted-foreground">…</span>;
  }

  if (user) {
    return (
      <>
        <Badge tone="neutral">
          {user.name} · {user.role}
        </Badge>
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

function RoleLinks() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <>
      {user.role === 'user' ? <Link href="/my/bids">My bids</Link> : null}
      {user.role === 'user' || user.role === 'staff' ? (
        <Link href="/watchlist">Watchlist</Link>
      ) : null}
      {user.role === 'staff' ? (
        <>
          <Link href="/seller">Seller</Link>
          <Link href="/seller/auctions/new">New auction</Link>
        </>
      ) : null}
      {user.role === 'admin' ? <Link href="/admin/auctions">Admin</Link> : null}
    </>
  );
}

export function ShellHeader({
  title,
  subtitle = 'Online Auction House',
}: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <header className="ui-shell-header">
      <div>
        <h1 className="ui-shell-title">{title}</h1>
        <p className="ui-shell-subtitle">{subtitle}</p>
      </div>
      <nav className="ui-shell-nav">
        <Link href="/">Home</Link>
        <Link href="/auctions">Auctions</Link>
        <RoleLinks />
        <AuthNav />
      </nav>
    </header>
  );
}
