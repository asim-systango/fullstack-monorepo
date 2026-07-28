'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@shared/ui';

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-muted-foreground">…</span>;
  }

  if (user) {
    return (
      <>
        <span className="text-sm text-muted-foreground">
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
    <header className="mb-7 flex items-center justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="m-0 text-[1.75rem] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 mb-0 text-sm text-muted-foreground">
          App starter — add your domain UI here
        </p>
      </div>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/">Home</Link>
        <AuthNav />
      </nav>
    </header>
  );
}
