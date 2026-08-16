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

/**
 * A comment plus its article, as returned by the moderation queue. `article`
 * tells you whether the comment is publicly reachable: a null
 * `publishedRevisionId` means the article is a draft, and a non-null `deletedAt`
 * means it has been removed from the blog.
 */
export type ModerationComment = Comment & {
  article: {
    id: string;
    title: string;
    slug: string;
    publishedRevisionId: string | null;
    deletedAt: string | null;
  };
};

export type ModerationCommentListResponse = {
  data: ModerationComment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ModerationCommentFilters = {
  page?: number;
  limit?: number;
  articleId?: string;
  /** Case-insensitive partial match on the comment body. */
  q?: string;
};

/**
 * Every comment on the platform, newest first. Editors and admins only —
 * authors receive 403. Includes comments on drafts and removed articles so
 * abusive content stays reachable.
 */
export async function fetchAllComments(
  params?: ModerationCommentFilters,
): Promise<ModerationCommentListResponse> {
  const { data } = await apiClient.get<ModerationCommentListResponse>('/comments', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      ...(params?.articleId ? { articleId: params.articleId } : {}),
      ...(params?.q ? { q: params.q } : {}),
    },
  });
  return data;
}

export async function fetchCommentStats(): Promise<{ total: number }> {
  const { data } = await apiClient.get<{ total: number }>('/comments/stats');
  return data;
}
