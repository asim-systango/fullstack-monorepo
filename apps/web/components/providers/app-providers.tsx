'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { AuthModalProvider } from '@/components/auth/auth-modal-context';
import { createQueryClient } from '@/lib/query';

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthModalProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthModalProvider>
    </QueryClientProvider>
  );
}
