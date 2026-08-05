'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { Badge, Button } from '@shared/ui/components';

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-sm text-muted-foreground">Loading…</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-semibold text-foreground">{user.name}</p>
          <Badge tone="neutral" className="text-[10px] uppercase tracking-wider">
            {user.role}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => void logout()}>
          Log out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        Get Started
      </Link>
    </div>
  );
}

export function ShellHeader({
  title,
  subtitle,
}: Readonly<{ title?: string; subtitle?: string }>) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg transition-transform group-hover:scale-105">
            ✚
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              PulseCare
            </span>
            <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              HOSPITAL
            </span>
          </div>
        </Link>

        {title ? (
          <div className="hidden md:block text-center">
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/doctors"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Doctors
          </Link>
          <Link
            href="/appointments"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Appointments
          </Link>
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
