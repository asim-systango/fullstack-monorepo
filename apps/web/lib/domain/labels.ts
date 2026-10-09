'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { unwrapData } from '@shared/api-client';
import { apiClient } from '@/lib/api';

const labelSchema = z.object({ id: z.string(), name: z.string(), color: z.string() });
export type Label = z.infer<typeof labelSchema>;

export function useLabels(projectId: string) {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/labels`);
      return labelSchema.array().parse(unwrapData(data));
    },
  });
}

export function useCreateLabel(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; color?: string }) => {
      const { data } = await apiClient.post(`/projects/${projectId}/labels`, input);
      return labelSchema.parse(unwrapData(data));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labels', projectId] }),
  });
}

export function useDeleteLabel(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (labelId: string) => {
      await apiClient.delete(`/projects/${projectId}/labels/${labelId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labels', projectId] }),
  });
}
