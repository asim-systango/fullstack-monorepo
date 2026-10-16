'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Badge, Button } from '@shared/ui/components';

function AuthNav() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const loginHref =
    pathname && pathname !== '/' && pathname !== '/login' && pathname !== '/register'
      ? `/login?next=${encodeURIComponent(pathname)}`
      : '/login';

  if (loading) {
    return (
      <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right text-xs">
          <span className="font-semibold text-foreground">{user.name || user.email}</span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            {user.role}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void logout()}
          className="text-xs"
        >
          Log out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={loginHref}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Log in
      </Link>
      <Link href="/register">
        <Button variant="primary" size="sm" className="text-xs font-semibold">
          Register
        </Button>
      </Link>
    </div>
  );
}

export function ShellHeader({
  title = 'EventHub Platform',
  subtitle = 'Event Management & Ticketing Engine',
}: Readonly<{ title?: string; subtitle?: string }>) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              E
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                {title}
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </Link>

          <Badge tone="accent" className="hidden lg:inline-flex text-[10px]">
            Monorepo Domain
          </Badge>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-muted-foreground">
          <Link href="/events" className="hover:text-foreground transition-colors">
            Browse Events
          </Link>

          {user && (
            <Link href="/tickets" className="hover:text-foreground transition-colors">
              My Tickets
            </Link>
          )}

          {user && (user.role === 'admin' || user.role === 'staff') && (
            <>
              <Link
                href="/organizer"
                className="hover:text-foreground transition-colors text-primary font-bold"
              >
                Organizer Dashboard
              </Link>
              <Link href="/check-in" className="hover:text-foreground transition-colors">
                Check-In Tool
              </Link>
            </>
          )}

          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
