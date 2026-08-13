'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthModal } from '@/components/auth/auth-modal-context';

export default function RegisterPage() {
  const router = useRouter();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    openAuth('register');
    router.replace('/');
  }, [openAuth, router]);

  return null;
}
