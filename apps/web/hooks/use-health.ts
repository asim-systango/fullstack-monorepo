'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '@/lib/api/health';
import { queryKeys } from '@/lib/query';

/** Example query hook — replace with your domain fetchers. */
export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health.root,
    queryFn: fetchHealth,
  });
}
