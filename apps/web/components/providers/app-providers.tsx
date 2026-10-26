'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider } from 'react-redux';
import { useState, type ReactNode } from 'react';
import { ApiClientError } from '@shared/api-client';
import { store } from '@/lib/store';
import { AuthProvider } from '@/components/auth';
import { ToastProvider } from '@/components/feedback';

// 4xx won't fix itself on a retry (403, 404, 400), only retry network / 5xx errors once
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiClientError && error.statusCode < 500) return false;
  return failureCount < 1;
}

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: shouldRetry,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
