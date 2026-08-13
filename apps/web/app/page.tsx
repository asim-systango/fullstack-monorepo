'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Page, Spinner } from '@shared/ui/components';
import { useAuth } from '@/components/auth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/projects' : '/login');
  }, [user, loading, router]);

  return (
    <Page>
      <Spinner />
    </Page>
  );
}
