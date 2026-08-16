'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useAuth } from '@/components/auth';
import { Spinner, Page } from '@shared/ui/components';

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <span className="text-xs text-muted-foreground">Authenticating session…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full overflow-y-auto px-0 py-6">
        <Page className="w-full min-w-0 max-w-none">{children}</Page>
      </main>
    </div>
  );
}
