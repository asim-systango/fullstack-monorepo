'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState, type ReactNode } from 'react';
import { onUnauthorized } from '@/lib/api/client';
import { createQueryClient } from '@/lib/query/client';
import { useAuthStore } from '@/lib/store';

function AuthBootstrap({ children }: Readonly<{ children: ReactNode }>) {
  const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    onUnauthorized(() => {
      clearUser();
    });
    void hydrateFromMe();
    return () => onUnauthorized(null);
  }, [clearUser, hydrateFromMe]);

  return children;
}

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>{children}</AuthBootstrap>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
