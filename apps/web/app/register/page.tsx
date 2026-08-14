'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useAuthModal } from '@/components/auth/auth-modal-context';

/** Mirrors /login: carries `?redirect=` into the modal-based auth flow. */
function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuth } = useAuthModal();
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    openAuth('register', redirectTo ?? undefined);
    router.replace('/');
  }, [openAuth, redirectTo, router]);

  return null;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRedirect />
    </Suspense>
  );
}
