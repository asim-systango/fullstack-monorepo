'use client';

import Link from 'next/link';
import { ApiClientError } from '@/lib/api';
import { formatLongDate } from '@/lib/format/date';
import { usePublicArticle } from '@/hooks/use-public-article';
import { pageGutter } from '@/components/home/page-gutter';
import { ArticleReader } from './article-reader';
import { CommentSection } from './comment-section';

/**
 * Shown for a slug that is missing, still a draft, or soft-deleted — the API
 * answers 404 for all three, and none of them may leak content.
 */
function ArticleNotFound({ isServerError }: Readonly<{ isServerError: boolean }>) {
  return (
    <div className={`${pageGutter} py-24 text-center`}>
      <h1 className="font-display text-3xl font-bold text-foreground">
        {isServerError ? 'Could not load article' : 'Article Not Found'}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {isServerError
          ? 'Check that the API is running, then try again.'
          : 'This article is not available.'}
      </p>
      <Link
        href="/blog"
        className="mt-8 inline-flex h-10 items-center rounded-pill bg-button-primary px-5 text-sm font-medium text-button-primary-foreground no-underline hover:bg-foreground"
      >
        Back to Blog
      </Link>
    </div>
  );
}

export function ArticleDetailView({ slug }: Readonly<{ slug: string }>) {
  const { data: article, isLoading, isError, error } = usePublicArticle(slug);

  if (isLoading) {
    return (
      <div className={`${pageGutter} py-16`}>
        <p className="text-sm text-muted-foreground">Loading story…</p>
      </div>
    );
  }

  if (isError || !article) {
    const notFound = error instanceof ApiClientError && error.statusCode === 404;
    return <ArticleNotFound isServerError={!notFound} />;
  }

  return (
    <div className="pb-20">
      <div className={`${pageGutter} pt-8`}>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground no-underline hover:text-foreground hover:underline"
        >
          ← Back to Blog
        </Link>
      </div>

      <div className={`${pageGutter} mt-8`}>
        <ArticleReader
          title={article.title}
          blocks={article.revision.content}
          media={article.revision.media}
          cover={article.revision.coverMedia}
          tags={article.tags}
          priorityCover
          meta={<span>Published {formatLongDate(article.publishedAt)}</span>}
        />

        <CommentSection articleId={article.id} />
      </div>
    </div>
  );
}
