'use client';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { unwrapData } from '@shared/api-client';
import { apiClient } from '@/lib/api';

const labelSchema = z.object({ id: z.string(), name: z.string(), color: z.string() });

export function useLabels(projectId: string) {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/labels`);
      return labelSchema.array().parse(unwrapData(data));
    },
  });
}
