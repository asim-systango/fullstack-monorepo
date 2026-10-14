'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function useFormErrors(debounceMs = 350) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const showRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const latestRef = useRef<ParseResult<unknown> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const flush = useCallback((result: ParseResult<unknown>) => {
    if (result.success) {
      setErrors({});
      return;
    }
    setErrors(result.errors);
  }, []);

  const applyParse = useCallback(
    <T,>(result: ParseResult<T>, forceShow = false) => {
      if (forceShow) {
        showRef.current = true;
        setShowErrors(true);
      }

      if (!showRef.current) return result.success;

      latestRef.current = result;

      if (forceShow) {
        if (timerRef.current != null) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        flush(result);
        return result.success;
      }

      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (latestRef.current) flush(latestRef.current);
      }, debounceMs);

      return result.success;
    },
    [debounceMs, flush],
  );

  const clearErrors = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    latestRef.current = null;
    showRef.current = false;
    setShowErrors(false);
    setErrors({});
  }, []);

  return { errors, showErrors, applyParse, clearErrors, setShowErrors };
}
