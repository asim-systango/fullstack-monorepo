'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createArticle,
  createRevision,
  deleteArticle,
  fetchArticleStats,
  fetchStudioArticle,
  fetchStudioArticles,
  publishArticle,
  submitArticleForReview,
  updateArticle,
  type CreateArticleInput,
  type CreateRevisionInput,
  type StudioArticleFilters,
  type UpdateArticleInput,
} from '@/lib/api/studio';
import { queryKeys } from '@/lib/query';

export function useStudioArticles(params?: StudioArticleFilters) {
  return useQuery({
    queryKey: queryKeys.articles.studio(params),
    queryFn: () => fetchStudioArticles(params),
  });
}

/**
 * Platform-wide counts for editor and admin dashboards. Restricted to
 * staff/admin by the API, so authors must not render this.
 */
export function useArticleStats() {
  return useQuery({
    queryKey: queryKeys.articles.stats,
    queryFn: fetchArticleStats,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

/**
 * Saving an edit appends a revision instead of overwriting one, so the article
 * detail has to be refetched to pick up the new entry in the history.
 */
export function useCreateRevision(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRevisionInput) => createRevision(articleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.articles.studioById(articleId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

export function useUpdateArticle(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateArticleInput) => updateArticle(articleId, input),
    onSuccess: (article) => {
      queryClient.setQueryData(queryKeys.articles.studioById(articleId), article);
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => deleteArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
      // Comment counts exclude comments on removed articles.
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}

/**
 * Author-side counterpart to publishing: hands the newest revision to an editor
 * without changing what the public blog serves.
 */
export function useSubmitForReview(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitArticleForReview(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.articles.studioById(articleId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, revisionId }: { articleId: string; revisionId: string }) =>
      publishArticle(articleId, revisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}
