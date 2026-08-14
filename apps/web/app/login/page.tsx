'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useAuthModal } from '@/components/auth/auth-modal-context';

/**
 * Sign-in lives in a modal, so this route only exists to carry the
 * `?redirect=` contract used by the route guards before handing over to it.
 */
function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuth } = useAuthModal();
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    openAuth('login', redirectTo ?? undefined);
    router.replace('/');
  }, [openAuth, redirectTo, router]);

  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirect />
    </Suspense>
  );
}
