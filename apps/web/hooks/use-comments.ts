'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  fetchAllComments,
  fetchCommentStats,
  fetchComments,
  updateComment,
  type ModerationCommentFilters,
} from '@/lib/api/comments';
import { queryKeys } from '@/lib/query';

/** `enabled` lets the caller hold off until the article is known to be published. */
export function useComments(articleId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.comments.byArticle(articleId ?? ''),
    queryFn: () => fetchComments(articleId!),
    enabled: Boolean(articleId),
  });
}

export function useCreateComment(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createComment(articleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byArticle(articleId),
      });
    },
  });
}

export function useUpdateComment(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
      updateComment(commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byArticle(articleId),
      });
    },
  });
}

export function useDeleteComment(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byArticle(articleId),
      });
    },
  });
}

/** Moderation queue for editors and admins. Authors receive 403. */
export function useModerationComments(params?: ModerationCommentFilters) {
  return useQuery({
    queryKey: queryKeys.comments.moderation(params),
    queryFn: () => fetchAllComments(params),
  });
}

export function useCommentStats() {
  return useQuery({
    queryKey: queryKeys.comments.stats,
    queryFn: fetchCommentStats,
  });
}

/**
 * Removes a comment from the moderation queue. Unlike `useDeleteComment` this is
 * not scoped to one article, so it refreshes every comment query rather than a
 * single article's thread.
 */
export function useModerateDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}
