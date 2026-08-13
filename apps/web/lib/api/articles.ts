import { apiClient } from './api-client';

export type PublicArticleCoverMedia = {
  id: string;
  secureUrl: string;
  resourceType: string;
  defaultAltText: string | null;
};

export type PublicArticleListItem = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  publishedRevisionId: string;
  tags: Array<{ id: string; name: string }>;
  coverMedia: PublicArticleCoverMedia | null;
};

export type PublicArticleListResponse = {
  data: PublicArticleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PublicContentBlock =
  | { id: string; type: 'paragraph'; markdown: string }
  | { id: string; type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { id: string; type: 'image'; mediaId: string; alt?: string; caption?: string }
  | { id: string; type: 'video'; mediaId: string; caption?: string }
  | { id: string; type: 'code'; code: string; language?: string };

export type PublicArticleDetail = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  tags: Array<{ id: string; name: string }>;
  revision: {
    id: string;
    content: PublicContentBlock[];
    coverMedia: PublicArticleCoverMedia | null;
  };
};

export async function fetchPublicArticles(params?: {
  page?: number;
  limit?: number;
}): Promise<PublicArticleListResponse> {
  const { data } = await apiClient.get<PublicArticleListResponse>('/articles/public', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    },
  });
  return data;
}

export async function fetchPublicArticleBySlug(
  slug: string,
): Promise<PublicArticleDetail> {
  const { data } = await apiClient.get<PublicArticleDetail>(
    `/articles/public/${encodeURIComponent(slug)}`,
  );
  return data;
}
