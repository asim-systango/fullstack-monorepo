'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getDashboardPath } from '@/lib/auth/roles';
import { useMe } from '@/hooks/use-auth';

export default function WriteRedirectPage() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? getDashboardPath(user.role) : '/');
    }
  }, [isLoading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Redirecting…
    </div>
  );
}
