'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { unwrapData } from '@shared/api-client';
import { apiClient } from '@/lib/api';
import { projectSchema, type Project } from './types';

async function listProjects(): Promise<Project[]> {
  const { data } = await apiClient.get('/projects');
  return projectSchema.array().parse(unwrapData(data));
}

async function createProject(input: { name: string; key: string }): Promise<Project> {
  const { data } = await apiClient.post('/projects', input);
  return projectSchema.parse(unwrapData(data));
}

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: listProjects });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/members`);
      return z
        .array(z.object({ id: z.string(), userId: z.string(), projectRole: z.string() }))
        .parse(unwrapData(data));
    },
  });
}
