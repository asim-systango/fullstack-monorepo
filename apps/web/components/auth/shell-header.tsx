'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@shared/ui';

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="muted">…</span>;
  }

  if (user) {
    return (
      <>
        <span className="muted">
          {user.name} ({user.role})
        </span>
        <Button variant="ghost" onClick={() => void logout()}>
          Log out
        </Button>
      </>
    );
  }

  return (
    <>
      <Link href="/login">Log in</Link>
      <Link href="/register">Register</Link>
    </>
  );
}

export function ShellHeader({ title }: { title: string }) {
  return (
    <header className="shell-header">
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>{title}</h1>
        <p className="muted" style={{ margin: '4px 0 0' }}>
          Fullstack boilerplate — add your domain UI here
        </p>
      </div>
      <nav className="shell-nav">
        <Link href="/">Home</Link>
        <AuthNav />
      </nav>
    </header>
  );
}
