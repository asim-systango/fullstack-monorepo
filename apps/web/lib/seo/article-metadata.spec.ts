import { excerptFromBlocks, toArticleMetadata } from './article-metadata';
import type { PublicArticleDetail } from '../api/articles';

const article: PublicArticleDetail = {
  id: '1',
  title: 'Understanding Hooks',
  slug: 'understanding-hooks',
  publishedAt: '2026-01-01T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
  ogImage: null,
  tags: [],
  revision: {
    id: 'rev-3',
    content: [
      { id: 'b1', type: 'paragraph', markdown: '**Hello** from [v3](https://x).' },
    ],
    coverMedia: {
      id: 'm1',
      secureUrl: 'https://res.cloudinary.com/demo/cover.jpg',
      resourceType: 'image',
      defaultAltText: 'Cover',
    },
    media: [],
  },
};

describe('excerptFromBlocks', () => {
  it('strips markdown from the first paragraph', () => {
    expect(excerptFromBlocks(article.revision.content)).toBe('Hello from v3.');
  });
});

describe('toArticleMetadata', () => {
  it('falls back to title, excerpt, cover, and /blog canonical', () => {
    const metadata = toArticleMetadata(article);
    expect(metadata.title).toBe('Understanding Hooks');
    expect(metadata.description).toBe('Hello from v3.');
    expect(metadata.alternates).toEqual({ canonical: '/blog/understanding-hooks' });
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://res.cloudinary.com/demo/cover.jpg' },
    ]);
  });

  it('prefers explicit SEO fields over fallbacks', () => {
    const metadata = toArticleMetadata({
      ...article,
      metaTitle: 'Custom title',
      metaDescription: 'Custom description',
      ogImage: 'https://cdn.example/og.png',
    });
    expect(metadata.title).toBe('Custom title');
    expect(metadata.description).toBe('Custom description');
    expect(metadata.openGraph?.images).toEqual([{ url: 'https://cdn.example/og.png' }]);
  });
});
