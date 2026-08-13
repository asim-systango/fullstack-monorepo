'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SiteHeader } from '@/components/home';
import { pageGutter } from '@/components/home/page-gutter';
import { Button } from '@/components/ui';
import { useLogout, useMe } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/auth-modal-context';

export default function WritePage() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();

  const { openAuth } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !user) {
      openAuth('register', '/write');
      router.replace('/');
    }
  }, [isLoading, user, router, openAuth]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className={`py-16 ${pageGutter}`}>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className={`py-16 ${pageGutter}`}>
        <h1 className="font-display text-3xl font-bold text-foreground">Write</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Welcome, {user.name}. Your writing workspace will live here — for now this page
          confirms you&apos;re signed in and can access protected routes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-pill border border-border-strong px-5 text-sm font-medium text-foreground no-underline hover:bg-surface-muted hover:no-underline"
          >
            Back to home
          </Link>
          <Button
            variant="outline"
            loading={logoutMutation.isPending}
            onClick={async () => {
              await logoutMutation.mutateAsync();
              router.push('/');
            }}
          >
            Sign out
          </Button>
        </div>
      </main>
    </div>
  );
}
