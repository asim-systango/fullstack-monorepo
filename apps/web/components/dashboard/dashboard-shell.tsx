'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/components/ui';
import { getRoleLabel, type GatewayRole } from '@/lib/auth/roles';
import { useLogout, useMe } from '@/hooks/use-auth';

type NavItem = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  role: GatewayRole;
  navItems?: NavItem[];
  /** Page-level actions rendered on the right of the title row. */
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  role,
  navItems = [],
  actions,
  children,
}: Readonly<DashboardShellProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();
  const logoutMutation = useLogout();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <div>
            <Link
              href="/"
              className="font-display text-xl font-bold text-foreground no-underline"
            >
              Wordnest
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {getRoleLabel(role)} workspace
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user?.name}</span>
            <Link href="/blog" className="text-foreground no-underline hover:underline">
              Blog
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logoutMutation.mutateAsync();
                router.push('/');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8 lg:px-8">
        {navItems.length > 0 ? (
          <aside className="hidden w-56 shrink-0 md:block">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm no-underline transition-colors',
                      active
                        ? 'bg-surface-muted font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        ) : null}

        <main className="min-w-0 flex-1">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
              {subtitle ? (
                <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
