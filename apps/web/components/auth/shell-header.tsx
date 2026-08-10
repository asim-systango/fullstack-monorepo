'use client';

import Link from 'next/link';
import { Activity, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from './auth-provider';
import {
  Badge,
  Button,
  ThemeToggle,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@shared/ui/components';

function AuthNav() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-xs text-muted-foreground animate-pulse">Loading…</span>;
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
      <Link href="/login">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <LogIn className="size-3.5" />
          Sign In
        </Button>
      </Link>
      <Link href="/register">
        <Button variant="primary" size="sm" className="gap-1.5">
          <UserPlus className="size-3.5" />
          Get Started
        </Button>
      </Link>
    </div>
  );
}

export function ShellHeader({
  title,
  subtitle,
}: Readonly<{ title?: string; subtitle?: string }>) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/80 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105 shadow-xs">
            <Activity className="size-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              PulseCare
            </span>
            <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground font-mono">
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

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hidden sm:inline"
          >
            Home
          </Link>
          <Link
            href="/doctors"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hidden sm:inline"
          >
            Doctors
          </Link>
          <Link
            href="/appointments"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hidden sm:inline"
          >
            Appointments
          </Link>

          <Tooltip>
            <TooltipTrigger>
              <ThemeToggle variant="ghost" size="sm" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle Theme</TooltipContent>
          </Tooltip>

          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
