'use client';

import { useEffect, useRef } from 'react';
import { toastApiError } from '@/lib/toast';

export function useToastQueryError(isError: boolean, error: unknown) {
  const lastError = useRef<unknown>(null);

  useEffect(() => {
    if (!isError || !error) {
      lastError.current = null;
      return;
    }

    if (lastError.current === error) return;
    lastError.current = error;
    toastApiError(error);
  }, [isError, error]);
}
