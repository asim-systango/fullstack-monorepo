import type { PublicArticleListItem } from '@/lib/api/articles';

export type FeedStory = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorInitials: string;
  publishedAt: string;
  coverUrl?: string;
  imageAlt?: string;
  tags: string[];
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function toFeedStory(article: PublicArticleListItem): FeedStory {
  const tag = article.tags[0]?.name ?? 'Wordnest';
  const initials = tag
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt:
      article.tags.length > 0
        ? article.tags.map((t) => t.name).join(' · ')
        : 'A story from Wordnest.',
    author: tag,
    authorInitials: initials || 'W',
    publishedAt: formatRelativeDate(article.publishedAt),
    coverUrl: article.coverMedia?.secureUrl,
    imageAlt: article.coverMedia?.defaultAltText ?? article.title,
    tags: article.tags.map((t) => t.name),
  };
}
