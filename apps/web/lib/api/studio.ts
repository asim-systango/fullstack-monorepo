import { apiClient } from './api-client';

export type StudioArticleListItem = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudioArticleListResponse = {
  data: StudioArticleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StudioRevision = {
  id: string;
  createdBy: string;
  coverMediaId: string | null;
  content: unknown[];
  createdAt: string;
};

export type StudioArticleDetail = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Array<{ id: string; name: string }>;
  revisions: StudioRevision[];
};

export type CreateArticleInput = {
  title: string;
  slug: string;
  body?: string;
  tagIds?: string[];
  coverMediaId?: string;
};

export type CreatedArticle = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: null;
  publishedAt: null;
  createdAt: string;
  updatedAt: string;
  revision: { id: string; content: unknown[]; createdAt: string };
  tags: Array<{ id: string; name: string }>;
};

export type PublishedArticle = {
  id: string;
  publishedRevisionId: string;
  publishedAt: string;
};

export async function fetchStudioArticles(params?: {
  page?: number;
  limit?: number;
}): Promise<StudioArticleListResponse> {
  const { data } = await apiClient.get<StudioArticleListResponse>('/articles/studio', {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 50 },
  });
  return data;
}

export async function fetchStudioArticle(id: string): Promise<StudioArticleDetail> {
  const { data } = await apiClient.get<StudioArticleDetail>(`/articles/studio/${id}`);
  return data;
}

export async function createArticle(input: CreateArticleInput): Promise<CreatedArticle> {
  const { data } = await apiClient.post<CreatedArticle>('/articles', input);
  return data;
}

export async function publishArticle(
  articleId: string,
  revisionId: string,
): Promise<PublishedArticle> {
  const { data } = await apiClient.post<PublishedArticle>(
    `/articles/${articleId}/publish`,
    {
      revisionId,
    },
  );
  return data;
}

export function isPublished(article: StudioArticleListItem): boolean {
  return article.publishedRevisionId !== null;
}

export function getLatestRevision(
  article: StudioArticleDetail,
): StudioRevision | undefined {
  return article.revisions.at(-1);
}

export function getRevisionLabel(index: number): string {
  return `v${index + 1}`;
}
