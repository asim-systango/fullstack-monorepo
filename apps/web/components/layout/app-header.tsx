'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge, Button, type BadgeTone } from '@shared/ui/components';
import { useAuth } from '@/components/auth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin', 'staff', 'user'] },
  { href: '/products', label: 'Products', roles: ['admin', 'staff', 'user'] },
  { href: '/warehouses', label: 'Warehouses', roles: ['admin', 'staff'] },
  { href: '/movements', label: 'Stock Movements', roles: ['admin', 'staff', 'user'] },
  { href: '/transfers', label: 'Transfers', roles: ['admin', 'staff'] },
  { href: '/purchase-orders', label: 'Purchase Orders', roles: ['admin', 'staff'] },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userRole = user?.role || 'user';

  const getRoleBadge = (role: string) => {
    let tone: BadgeTone = 'neutral';
    let label = 'Clerk';

    if (role === 'admin') {
      tone = 'success';
      label = 'Admin';
    } else if (role === 'staff') {
      tone = 'accent';
      label = 'Manager';
    }

    return <Badge tone={tone}>{label}</Badge>;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Branding & Domain Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-sm shadow-xs">
              INV
            </span>
            <span className="hidden sm:inline">Inventory & Warehouse</span>
          </Link>
          <span className="text-border">|</span>
          {getRoleBadge(userRole)}
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {NAV_ITEMS.map((item) => {
            const isAllowed = item.roles.includes(userRole);
            if (!isAllowed) return null;

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-xs text-muted-foreground">
                {user.email}
              </span>
              <Button variant="secondary" size="sm" onClick={() => void logout()}>
                Sign out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Log in
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="flex md:hidden overflow-x-auto border-t border-border/50 px-4 py-2 space-x-1">
        {NAV_ITEMS.map((item) => {
          const isAllowed = item.roles.includes(userRole);
          if (!isAllowed) return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
