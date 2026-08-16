'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WriteIcon } from './icons';
import { getDashboardLabel, getDashboardPath, getRoleLabel } from '@/lib/auth/roles';
import { useMe } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/auth-modal-context';

function WriteAction() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const { openAuth } = useAuthModal();

  function handleWrite() {
    if (isLoading) return;
    if (user) {
      router.push(getDashboardPath(user.role));
      return;
    }
    openAuth('register');
  }

  return (
    <button
      type="button"
      onClick={handleWrite}
      className="inline-flex items-center gap-1.5 px-1 py-1.5 text-[0.9375rem] text-muted-foreground hover:text-foreground"
    >
      <WriteIcon className="size-4" />
      <span className="hidden sm:inline">Write</span>
    </button>
  );
}

export function AuthHeaderActions() {
  const { data: user, isLoading } = useMe();
  const { openAuth } = useAuthModal();
  const isAuthenticated = Boolean(user);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Loading…</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const dashboardHref = getDashboardPath(user.role);
    const dashboardLabel = getDashboardLabel(user.role);

    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <WriteAction />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user.name} · {getRoleLabel(user.role)}
        </span>
        <Link
          href={dashboardHref}
          className="inline-flex h-10 items-center justify-center rounded-pill bg-button-primary px-5 text-[0.9375rem] font-medium text-button-primary-foreground no-underline transition-colors hover:bg-foreground hover:no-underline"
        >
          {dashboardLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <WriteAction />
      <button
        type="button"
        onClick={() => openAuth('login')}
        className="px-1 py-1.5 text-[0.9375rem] text-foreground hover:underline"
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => openAuth('register')}
        className="inline-flex h-10 items-center justify-center rounded-pill bg-button-primary px-5 text-[0.9375rem] font-medium text-button-primary-foreground transition-colors hover:bg-foreground"
      >
        Sign Up
      </button>
    </div>
  );
}
