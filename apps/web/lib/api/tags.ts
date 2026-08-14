import { apiClient } from './api-client';

/** Item from `GET /tags` — carries the usage count that management views need. */
export type Tag = {
  id: string;
  name: string;
  /** Lowercased key behind the case-insensitive unique constraint. */
  normalizedName: string;
  /** Articles carrying this tag, excluding soft-deleted ones. */
  articleCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Payload returned by create, rename, and get-by-id — no usage count. */
export type TagDetail = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
export async function createTag(name: string): Promise<TagDetail> {
  const { data } = await apiClient.post<TagDetail>('/tags', { name });
  return data;
}

export async function updateTag(id: string, name: string): Promise<TagDetail> {
  const { data } = await apiClient.patch<TagDetail>(`/tags/${id}`, { name });
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}
