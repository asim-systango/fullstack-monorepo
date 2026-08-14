import type { PublicArticlesParams } from '@/lib/api/articles';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  health: {
    root: ['health'] as const,
  },
  articles: {
    all: ['articles'] as const,
    public: (params?: PublicArticlesParams) => ['articles', 'public', params] as const,
    publicBySlug: (slug: string) => ['articles', 'public', slug] as const,
    studio: (params?: { page?: number; limit?: number }) =>
      ['articles', 'studio', params] as const,
    studioById: (id: string) => ['articles', 'studio', id] as const,
  },
  comments: {
    all: ['comments'] as const,
    byArticle: (articleId: string) => ['comments', articleId] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: (params?: { page?: number; limit?: number }) => ['tags', params] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
  },
} as const;
