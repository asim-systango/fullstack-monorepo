'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrapData } from '@shared/api-client';
import { apiClient } from '@/lib/api';
import { issueDetailSchema, issueSchema, type Issue, type IssueDetail } from './types';

export type IssueFilter = {
  status?: string;
  labelId?: string;
  assigneeId?: string;
  page?: number;
};

export function useIssues(projectId: string, filter: IssueFilter = {}) {
  return useQuery({
    queryKey: ['issues', projectId, filter],
    queryFn: async (): Promise<Issue[]> => {
      const { data } = await apiClient.get(`/projects/${projectId}/issues`, {
        params: filter,
      });
      return issueSchema.array().parse(unwrapData(data));
    },
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: async (): Promise<IssueDetail> => {
      const { data } = await apiClient.get(`/issues/${id}`);
      return issueDetailSchema.parse(unwrapData(data));
    },
  });
}

export function useCreateIssue(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      assigneeId?: string;
      labelIds?: string[];
    }) => {
      const { data } = await apiClient.post(`/projects/${projectId}/issues`, input);
      return issueSchema.parse(unwrapData(data));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues', projectId] }),
  });
}

export function useChangeStatus(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/issues/${id}/status`, { status });
      return issueSchema.parse(unwrapData(data));
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['issues', projectId] });
      qc.invalidateQueries({ queryKey: ['issue', v.id] });
    },
  });
}

export function useAddComment(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      await apiClient.post(`/issues/${issueId}/comments`, { body });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', issueId] }),
  });
}

export function useAssignSprint(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sprintId: string | null) => {
      const { data } = await apiClient.patch(`/issues/${issueId}/sprint`, {
        sprintId: sprintId ?? undefined,
      });
      return issueSchema.parse(unwrapData(data));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', issueId] }),
  });
}

export function useAddIssueLabel(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (labelId: string) => {
      await apiClient.post(`/issues/${issueId}/labels/${labelId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', issueId] }),
  });
}

export function useRemoveIssueLabel(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (labelId: string) => {
      await apiClient.delete(`/issues/${issueId}/labels/${labelId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issue', issueId] }),
  });
}
