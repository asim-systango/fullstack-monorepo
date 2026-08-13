'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPublicArticleBySlug } from '@/lib/api/articles';
import { queryKeys } from '@/lib/query';

export function usePublicArticle(slug: string) {
  return useQuery({
    queryKey: queryKeys.articles.publicBySlug(slug),
    queryFn: () => fetchPublicArticleBySlug(slug),
    enabled: Boolean(slug),
  });
}
