'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPublicArticles } from '@/lib/api/articles';
import { queryKeys } from '@/lib/query';

export function usePublicArticles(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.articles.public(params),
    queryFn: () => fetchPublicArticles(params),
  });
}
