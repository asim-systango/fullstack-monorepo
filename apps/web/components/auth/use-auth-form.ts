'use client';

import { useCallback, useState } from 'react';
import type { z } from 'zod';
import { toUserMessage } from '@/lib/auth/errors';
import { fieldErrorsFromZod } from '@/lib/validation/auth';

export function useAuthForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const submit = useCallback(
    async <T>(opts: {
      schema: z.ZodType<T>;
      values: unknown;
      onValid: (data: T) => Promise<void>;
      onError?: (err: unknown) => boolean;
    }): Promise<boolean> => {
      setPending(true);
      resetErrors();
      const parsed = opts.schema.safeParse(opts.values);
      if (!parsed.success) {
        setFieldErrors(fieldErrorsFromZod(parsed.error));
        setPending(false);
        return false;
      }
      try {
        await opts.onValid(parsed.data);
        return true;
      } catch (err) {
        if (!opts.onError?.(err)) {
          setError(toUserMessage(err));
        }
        return false;
      } finally {
        setPending(false);
      }
    },
    [resetErrors],
  );

  return { pending, error, setError, fieldErrors, submit };
}
