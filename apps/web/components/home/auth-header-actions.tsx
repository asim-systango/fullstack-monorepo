'use client';

import { useRouter } from 'next/navigation';
import { WriteIcon } from './icons';
import { useMe } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/auth-modal-context';

function signInLabel(
  isLoading: boolean,
  isAuthenticated: boolean,
  name?: string,
): string {
  if (isLoading) return 'Sign in';
  if (isAuthenticated) return name ?? 'Account';
  return 'Sign in';
}

export function AuthHeaderActions() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const { openAuth } = useAuthModal();
  const isAuthenticated = Boolean(user);
  const signInText = signInLabel(isLoading, isAuthenticated, user?.name);

  function handleWrite() {
    if (isLoading) return;
    if (isAuthenticated) {
      router.push('/write');
      return;
    }
    openAuth('register', '/write');
  }

  function handleGetStarted() {
    if (isLoading) return;
    if (isAuthenticated) {
      router.push('/write');
      return;
    }
    openAuth('register');
  }

  return (
    <>
      <button
        type="button"
        onClick={handleWrite}
        className="inline-flex items-center gap-1.5 px-1 py-1.5 text-[0.9375rem] text-muted-foreground hover:text-foreground"
      >
        <WriteIcon className="size-4" />
        <span className="hidden sm:inline">Write</span>
      </button>

      <button
        type="button"
        onClick={() => openAuth('login')}
        className="px-1 py-1.5 text-[0.9375rem] text-foreground hover:underline"
      >
        {signInText}
      </button>

      <button
        type="button"
        onClick={handleGetStarted}
        className="inline-flex h-10 items-center justify-center rounded-pill bg-button-primary px-5 text-[0.9375rem] font-medium text-button-primary-foreground transition-colors hover:bg-foreground"
      >
        Get started
      </button>
    </>
  );
}
