export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  health: {
    root: ['health'] as const,
  },
  articles: {
    all: ['articles'] as const,
    public: (params?: { page?: number; limit?: number }) =>
      ['articles', 'public', params] as const,
    publicBySlug: (slug: string) => ['articles', 'public', slug] as const,
    studio: (params?: { page?: number; limit?: number }) =>
      ['articles', 'studio', params] as const,
    studioById: (id: string) => ['articles', 'studio', id] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
  },
} as const;
