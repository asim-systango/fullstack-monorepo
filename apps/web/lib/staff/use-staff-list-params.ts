'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedValue } from './use-debounced-value';

export function useStaffListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string) => searchParams.get(key) ?? '',
    [searchParams],
  );

  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1);

  const replace = useCallback(
    (
      patch: Record<string, string | number | boolean | undefined | null>,
      opts?: { resetPage?: boolean },
    ) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === '' || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const shouldResetPage = opts?.resetPage !== false && !('page' in patch);
      if (shouldResetPage) next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      replace({ page: nextPage > 1 ? nextPage : undefined }, { resetPage: false });
    },
    [replace],
  );

  const clear = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasFilters = [...searchParams.keys()].some((key) => key !== 'page');

  return { get, page, replace, setPage, clear, hasFilters, searchParams };
}

export function useDebouncedUrlQuery(key: string, delayMs = 250) {
  const { get, replace } = useStaffListParams();
  const urlValue = get(key);
  const [draft, setDraft] = useState(urlValue);
  const debounced = useDebouncedValue(draft, delayMs);

  useEffect(() => {
    setDraft(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (debounced === urlValue) return;
    replace({ [key]: debounced || undefined });
  }, [debounced, key, replace, urlValue]);

  return { value: draft, setValue: setDraft, committed: urlValue };
}
