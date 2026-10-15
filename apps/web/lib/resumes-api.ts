import { unwrapData } from '@shared/api-client';
import { apiClient } from './api';
import type {
  CreateResumeInput,
  Resume,
  ResumeListQuery,
  ResumeListResponse,
  Template,
  UpdateResumeInput,
} from './resume-types';

function toQuery(params: ResumeListQuery): string {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.templateId) search.set('templateId', params.templateId);
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const resumesApi = {
  async listOwn(query: ResumeListQuery = {}): Promise<ResumeListResponse> {
    const { data } = await apiClient.get(`/resumes${toQuery(query)}`);
    return unwrapData<ResumeListResponse>(data);
  },

  async listAll(query: ResumeListQuery = {}): Promise<ResumeListResponse> {
    const { data } = await apiClient.get(`/admin/resumes${toQuery(query)}`);
    return unwrapData<ResumeListResponse>(data);
  },

  async getOne(id: string): Promise<Resume> {
    const { data } = await apiClient.get(`/resumes/${id}`);
    return unwrapData<Resume>(data);
  },

  async create(input: CreateResumeInput): Promise<Resume> {
    const { data } = await apiClient.post('/resumes', input);
    return unwrapData<Resume>(data);
  },

  async update(id: string, input: UpdateResumeInput): Promise<Resume> {
    const { data } = await apiClient.put(`/resumes/${id}`, input);
    return unwrapData<Resume>(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  },

  async publish(id: string): Promise<Resume> {
    const { data } = await apiClient.post(`/resumes/${id}/publish`);
    return unwrapData<Resume>(data);
  },

  async unpublish(id: string): Promise<Resume> {
    const { data } = await apiClient.post(`/resumes/${id}/unpublish`);
    return unwrapData<Resume>(data);
  },

  async duplicate(id: string): Promise<Resume> {
    const { data } = await apiClient.post(`/resumes/${id}/duplicate`);
    return unwrapData<Resume>(data);
  },

  async getPublic(slug: string): Promise<Resume> {
    const { data } = await apiClient.get(`/public/resumes/${encodeURIComponent(slug)}`);
    return unwrapData<Resume>(data);
  },
};

export const templatesApi = {
  async list(): Promise<Template[]> {
    const { data } = await apiClient.get('/templates');
    return unwrapData<Template[]>(data);
  },

  async update(id: string, input: { isActive: boolean }): Promise<Template> {
    const { data } = await apiClient.patch(`/templates/${id}`, input);
    return unwrapData<Template>(data);
  },
};
