import { apiClient } from '@/lib/api/client';
import type { Bookmark } from '@/lib/api/types';

export async function listBookmarks(): Promise<Bookmark[]> {
  const { data } = await apiClient.get<Bookmark[]>('/bookmarks');
  return data;
}

export async function createBookmark(jobId: string): Promise<Bookmark> {
  const { data } = await apiClient.post<Bookmark>('/bookmarks', { jobId });
  return data;
}

/** Path param is jobId — not bookmark id (BookmarksController). */
export async function removeBookmarkByJobId(jobId: string): Promise<{ ok: true }> {
  const { data } = await apiClient.delete<{ ok: true }>(`/bookmarks/${jobId}`);
  return data;
}
