'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { AppRole } from '@/lib/auth/jwt';
import { homePathForRole, requiresPasswordChange } from '@/lib/auth/session';
import { useAuthStore } from '@/lib/store';

const publicLinks = [{ href: '/jobs', label: 'Jobs' }];

const userLinks = [
  { href: '/jobs', label: 'Jobs' },
  { href: '/my/applications', label: 'Applications' },
  { href: '/my/resumes', label: 'Resumes' },
  { href: '/bookmarks', label: 'Bookmarks' },
];

const staffLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/company/jobs', label: 'Jobs' },
  { href: '/company/applications', label: 'Applications' },
];

const adminLinks = [
  { href: '/admin/companies', label: 'Companies' },
  { href: '/admin/staff/new', label: 'New staff' },
];

function linksForRole(role: AppRole | undefined) {
  if (role === 'admin') return adminLinks;
  if (role === 'staff') return staffLinks;
  if (role === 'user') return userLinks;
  return publicLinks;
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;
    if (requiresPasswordChange(user) && pathname !== '/change-password') {
      router.replace('/change-password');
    }
  }, [status, user, pathname, router]);

  const links = linksForRole(user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-nav">
      <div className="mx-auto flex h-nav max-w-feed items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-md font-bold text-brand no-underline">
            Job Portal
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-2 py-1 text-sm font-medium no-underline',
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? 'bg-brand-soft text-brand'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {status === 'authenticated' && user ? (
            <>
              <span className="hidden text-sm text-secondary sm:inline">
                {user.name} · {user.role}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
              >
                Sign out
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="hidden md:inline-flex"
                onClick={() => router.push(homePathForRole(user.role))}
              >
                Home
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => router.push('/login')}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => router.push('/register')}>
                Join now
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
