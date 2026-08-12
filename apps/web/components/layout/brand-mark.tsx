'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth';
import { homePathForRole } from '@/lib/auth-routes';

type BrandMarkProps = Readonly<{
  /** Optional override. Defaults to `/` when logged out, role home when logged in. */
  href?: string;
}>;

export function BrandMark({ href }: BrandMarkProps) {
  const { user } = useAuth();
  const resolvedHref = href ?? (user ? homePathForRole(user.role) : '/');

  return (
    <Link
      href={resolvedHref}
      style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--tg-hero)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        T
      </div>
      <span style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--tg-text)' }}>TastyGo</span>
    </Link>
  );
}
