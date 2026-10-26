'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState, Page } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { ROLE_HOME } from '@/lib/auth/routing';

// "/" just sends everyone to their own home page
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? ROLE_HOME[user.role] : '/login');
  }, [loading, user, router]);

  return (
    <Page>
      <LoadingState variant="block" label="Opening your workspace…" />
    </Page>
  );
}
