'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ApiClientError } from '@/lib/api';
import { usePublicArticle } from '@/hooks/use-public-article';
import { ArticleContent } from './article-content';
import { pageGutter } from '@/components/home/page-gutter';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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
    return (
      <div className={`${pageGutter} py-16`}>
        <h1 className="font-display text-3xl font-bold text-foreground">
          {notFound ? 'Story not found' : 'Could not load story'}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {notFound
            ? 'This article is unpublished, deleted, or the link is wrong.'
            : 'Check that the API is running, then try again.'}
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-foreground underline">
          Back to home
        </Link>
      </div>
    );
  }

  const cover = article.revision.coverMedia;

  return (
    <article className="pb-20">
      <div className={`${pageGutter} pt-8`}>
        <Link
          href="/#trending"
          className="text-sm text-muted-foreground no-underline hover:text-foreground hover:underline"
        >
          ← Back to stories
        </Link>

        <header className="mx-auto mt-8 max-w-content-wide">
          {article.tags.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {article.tags.map((tag) => tag.name).join(' · ')}
            </p>
          ) : null}

          <h1 className="mt-3 font-display text-4xl leading-tight font-bold tracking-tight text-foreground md:text-5xl">
            {article.title}
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Published {formatDate(article.publishedAt)}
          </p>
        </header>
      </div>

      {cover ? (
        <div className={`${pageGutter} mt-10`}>
          <div className="relative mx-auto aspect-[16/9] max-w-content-wide overflow-hidden rounded-lg bg-surface-muted md:aspect-[2/1]">
            <Image
              src={cover.secureUrl}
              alt={cover.defaultAltText ?? article.title}
              fill
              priority
              sizes="(max-width: 1192px) 100vw, 960px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className={`${pageGutter} mt-12`}>
        <ArticleContent blocks={article.revision.content} />
      </div>
    </article>
  );
}
