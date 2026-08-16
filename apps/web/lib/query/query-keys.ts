import type { PublicArticlesParams } from '@/lib/api/articles';
import type { ModerationCommentFilters } from '@/lib/api/comments';
import type { StudioArticleFilters } from '@/lib/api/studio';

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
    studio: (params?: StudioArticleFilters) => ['articles', 'studio', params] as const,
    studioById: (id: string) => ['articles', 'studio', id] as const,
    stats: ['articles', 'stats'] as const,
  },
  comments: {
    all: ['comments'] as const,
    byArticle: (articleId: string) => ['comments', articleId] as const,
    moderation: (params?: ModerationCommentFilters) =>
      ['comments', 'moderation', params] as const,
    stats: ['comments', 'stats'] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: (params?: { page?: number; limit?: number }) => ['tags', params] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
  },
} as const;
