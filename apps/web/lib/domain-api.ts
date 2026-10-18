import { unwrapData } from '@shared/api-client';
import { apiClient } from './api';
import type {
  Issue,
  IssueStatus,
  Label,
  Paginated,
  Project,
  ProjectMember,
} from './domain-types';

export const projectsApi = {
  async list(params?: { page?: number; limit?: number; q?: string }) {
    const { data } = await apiClient.get('/projects', { params });
    return unwrapData<Paginated<Project>>(data);
  },
  async get(id: string) {
    const { data } = await apiClient.get(`/projects/${id}`);
    return unwrapData<Project>(data);
  },
  async create(body: { name: string; key: string }) {
    const { data } = await apiClient.post('/projects', body);
    return unwrapData<Project>(data);
  },
  async addMember(projectId: string, body: { email: string; role?: 'lead' | 'member' }) {
    const { data } = await apiClient.post(`/projects/${projectId}/members`, body);
    return unwrapData<ProjectMember>(data);
  },
  async removeMember(projectId: string, userId: string) {
    const { data } = await apiClient.delete(`/projects/${projectId}/members/${userId}`);
    return unwrapData<{ projectId: string; userId: string }>(data);
  },
};

export const issuesApi = {
  async list(
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: IssueStatus;
      labelId?: string;
      assigneeId?: string;
      q?: string;
    },
  ) {
    const { data } = await apiClient.get(`/projects/${projectId}/issues`, { params });
    return unwrapData<Paginated<Issue>>(data);
  },
  async mine(params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get('/issues/mine', { params });
    return unwrapData<Paginated<Issue>>(data);
  },
  async get(id: string) {
    const { data } = await apiClient.get(`/issues/${id}`);
    return unwrapData<Issue>(data);
  },
  async create(
    projectId: string,
    body: {
      title: string;
      description?: string;
      assigneeId?: string;
      labelIds?: string[];
    },
  ) {
    const { data } = await apiClient.post(`/projects/${projectId}/issues`, body);
    return unwrapData<Issue>(data);
  },
  async updateStatus(id: string, status: IssueStatus) {
    const { data } = await apiClient.patch(`/issues/${id}/status`, { status });
    return unwrapData<Issue>(data);
  },
  async softDelete(id: string) {
    const { data } = await apiClient.delete(`/issues/${id}`);
    return unwrapData<{ id: string }>(data);
  },
  async addComment(id: string, body: string) {
    const { data } = await apiClient.post(`/issues/${id}/comments`, { body });
    return unwrapData<{ id: string; body: string }>(data);
  },
};

export const labelsApi = {
  async list(projectId: string) {
    const { data } = await apiClient.get(`/projects/${projectId}/labels`);
    return unwrapData<Label[]>(data);
  },
  async create(projectId: string, body: { name: string; color?: string }) {
    const { data } = await apiClient.post(`/projects/${projectId}/labels`, body);
    return unwrapData<Label>(data);
  },
};
