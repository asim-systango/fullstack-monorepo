'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  fetchComments,
  updateComment,
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
