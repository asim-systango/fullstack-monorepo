'use client';

import { useEffect, useRef } from 'react';
import { toastApiError } from '@/lib/toast';

/** Show a generic toast when a React Query request fails (never leak API text). */
export function useToastQueryError(isError: boolean, error: unknown) {
  const lastError = useRef<unknown>(null);

  useEffect(() => {
    if (!isError || !error) {
      lastError.current = null;
      return;
    }
    // Avoid re-toasting the same error object on re-renders.
    if (lastError.current === error) return;
    lastError.current = error;
    toastApiError(error);
  }, [isError, error]);
}
