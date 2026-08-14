'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPublicArticles, type PublicArticlesParams } from '@/lib/api/articles';
import { queryKeys } from '@/lib/query';

export function usePublicArticles(params?: PublicArticlesParams) {
  return useQuery({
    queryKey: queryKeys.articles.public(params),
    queryFn: () => fetchPublicArticles(params),
    // Keeps the current results on screen while a new search/tag query resolves.
    placeholderData: keepPreviousData,
  });
}
