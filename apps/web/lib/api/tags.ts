import { apiClient } from './api-client';

export type Tag = {
  id: string;
  name: string;
};

export type TagListResponse = {
  data: Tag[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Requires authentication — the tag catalog is not a public endpoint. */
export async function fetchTags(params?: {
  page?: number;
  limit?: number;
}): Promise<TagListResponse> {
  const { data } = await apiClient.get<TagListResponse>('/tags', {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 100 },
  });
  return data;
}

/** Editors and admins only. */
export async function createTag(name: string): Promise<Tag> {
  const { data } = await apiClient.post<Tag>('/tags', { name });
  return data;
}

export async function updateTag(id: string, name: string): Promise<Tag> {
  const { data } = await apiClient.patch<Tag>(`/tags/${id}`, { name });
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}
