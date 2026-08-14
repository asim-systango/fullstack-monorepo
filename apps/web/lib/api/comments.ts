import { apiClient } from './api-client';

export type Comment = {
  id: string;
  articleId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CommentListResponse = {
  data: Comment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Comments only exist for published, non-deleted articles — the API answers 404
 * otherwise, which is what keeps drafts from leaking through this route.
 */
export async function fetchComments(
  articleId: string,
  params?: { page?: number; limit?: number },
): Promise<CommentListResponse> {
  const { data } = await apiClient.get<CommentListResponse>(
    `/articles/${articleId}/comments`,
    { params: { page: params?.page ?? 1, limit: params?.limit ?? 50 } },
  );
  return data;
}

export async function createComment(articleId: string, body: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>(`/articles/${articleId}/comments`, {
    body,
  });
  return data;
}

export async function updateComment(commentId: string, body: string): Promise<Comment> {
  const { data } = await apiClient.patch<Comment>(`/comments/${commentId}`, { body });
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}
