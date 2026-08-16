import { NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesRepository } from './articles.repository';
import type { PublicArticleDetail } from './dto/public-article.dto';

describe('ArticlesService public reads', () => {
  const repository = {
    listPublicArticles: jest.fn(),
    findPublicArticleBySlug: jest.fn(),
  };

  const service = new ArticlesService(repository as unknown as ArticlesRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes search and tag through to the published-only list query', async () => {
    repository.listPublicArticles.mockResolvedValue({ items: [], total: 0 });

    const result = await service.listPublicArticles({
      page: 2,
      limit: 20,
      q: 'react',
      tag: 'ai',
    });

    expect(repository.listPublicArticles).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      search: 'react',
      tag: 'ai',
    });
    expect(result).toEqual({
      data: [],
      page: 2,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it('lowercases the public tag filter so seeded display names still match', async () => {
    repository.listPublicArticles.mockResolvedValue({ items: [], total: 0 });

    await service.listPublicArticles({
      page: 1,
      limit: 20,
      tag: 'Generative AI',
    });

    expect(repository.listPublicArticles).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      tag: 'generative ai',
    });
  });

  it('returns the published revision payload, including SEO fields', async () => {
    const article: PublicArticleDetail = {
      id: 'article-1',
      title: 'Hooks',
      slug: 'hooks',
      publishedAt: new Date('2026-01-01'),
      metaTitle: 'SEO title',
      metaDescription: 'SEO description',
      ogImage: 'https://cdn.example/og.png',
      tags: [],
      revision: {
        id: 'rev-3',
        content: [],
        coverMedia: null,
        media: [],
      },
    };
    repository.findPublicArticleBySlug.mockResolvedValue(article);

    await expect(service.getPublicArticleBySlug('hooks')).resolves.toEqual(article);
    expect(repository.findPublicArticleBySlug).toHaveBeenCalledWith({ slug: 'hooks' });
  });

  it('404s unpublished, deleted, and unknown slugs the same way', async () => {
    repository.findPublicArticleBySlug.mockResolvedValue(null);

    await expect(service.getPublicArticleBySlug('draft-slug')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
