'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button } from '@shared/ui/components';
import { ROUTES } from '@/lib/auth/routes';

function AuthNav() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <span className="text-sm text-muted-foreground">…</span>;
  }

  if (user) {
    return (
      <>
        <Link href={ROUTES.dashboard}>Dashboard</Link>
        <span className="font-mono text-xs text-muted-foreground">
          {user.name} · {user.role}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void logout().then(() => {
              router.replace(ROUTES.login);
              router.refresh();
            });
          }}
        >
          Log out
        </Button>
      </>
    );
  }

  return (
    <>
      <Link href={ROUTES.login}>Log in</Link>
      <Link
        href={ROUTES.register}
        className="ui-button ui-button-sm ui-button-primary no-underline hover:no-underline"
      >
        Register
      </Link>
    </>
  );
}

export function ShellHeader({
  title,
  subtitle,
}: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <header className="ui-shell-header">
      <div>
        <h1 className="ui-shell-title">{title}</h1>
        {subtitle ? <p className="ui-shell-subtitle">{subtitle}</p> : null}
      </div>
      <nav className="ui-shell-nav" aria-label="Site">
        <Link href={ROUTES.home}>Home</Link>
        <AuthNav />
      </nav>
    </header>
  );
}
