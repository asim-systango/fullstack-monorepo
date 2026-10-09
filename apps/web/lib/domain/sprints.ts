'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { unwrapData } from '@shared/api-client';
import { apiClient } from '@/lib/api';

const sprintSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});
export type Sprint = z.infer<typeof sprintSchema>;

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/sprints`);
      return sprintSchema.array().parse(unwrapData(data));
    },
  });
}

export function useCreateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; startDate?: string; endDate?: string }) => {
      const { data } = await apiClient.post(`/projects/${projectId}/sprints`, input);
      return sprintSchema.parse(unwrapData(data));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sprints', projectId] }),
  });
}
