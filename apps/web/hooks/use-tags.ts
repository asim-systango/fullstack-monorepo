'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTag, deleteTag, fetchTags, updateTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/query';

/** `GET /tags` requires a session, so callers gate this behind an authenticated view. */
export function useTags(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.tags.list(params),
    queryFn: () => fetchTags(params),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateTag(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}
