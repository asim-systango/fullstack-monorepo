'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchStudioArticle,
  fetchStudioArticles,
  type CreateArticleInput,
} from '@/lib/api/studio';
import { queryKeys } from '@/lib/query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createArticle, publishArticle } from '@/lib/api/studio';

export function useStudioArticles(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.articles.studio(params),
    queryFn: () => fetchStudioArticles(params),
  });
}

export function useStudioArticle(id: string) {
  return useQuery({
    queryKey: queryKeys.articles.studioById(id),
    queryFn: () => fetchStudioArticle(id),
    enabled: Boolean(id),
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateArticleInput) => createArticle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', 'studio'] });
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, revisionId }: { articleId: string; revisionId: string }) =>
      publishArticle(articleId, revisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
