'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { pageGutter } from '@/components/home/page-gutter';
import { Button } from '@/components/ui';
import type { PublicArticleListItem } from '@/lib/api/articles';
import { formatLongDate } from '@/lib/format/date';
import { usePublicArticles } from '@/hooks/use-public-articles';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

function ArticleCard({ article }: Readonly<{ article: PublicArticleListItem }>) {
  return (
    <article className="flex flex-col gap-4 py-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        {article.tags.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {article.tags.map((tag) => tag.name).join(' · ')}
          </p>
        ) : null}

        <h2 className="mt-2 font-display text-2xl font-bold">
          <Link
            href={`/blog/${article.slug}`}
            className="text-foreground no-underline hover:underline"
          >
            {article.title}
          </Link>
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {formatLongDate(article.publishedAt)}
        </p>
      </div>

      {article.coverMedia ? (
        <Link
          href={`/blog/${article.slug}`}
          className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:w-48"
        >
          <Image
            src={article.coverMedia.secureUrl}
            alt={article.coverMedia.defaultAltText ?? article.title}
            fill
            sizes="192px"
            className="object-cover"
          />
        </Link>
      ) : null}
    </article>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-8 sm:flex-row sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <span className="block h-4 w-24 animate-pulse rounded bg-surface-muted" />
        <span className="block h-7 w-3/4 animate-pulse rounded bg-surface-muted" />
        <span className="block h-4 w-32 animate-pulse rounded bg-surface-muted" />
      </div>
      <span className="block aspect-[3/2] w-full animate-pulse rounded-lg bg-surface-muted sm:w-48" />
    </div>
  );
}

function blogHref(input: { q?: string; tag?: string; page?: number }): string {
  const params = new URLSearchParams();
  if (input.q) params.set('q', input.q);
  if (input.tag) params.set('tag', input.tag);
  if (input.page && input.page > 1) params.set('page', String(input.page));
  const query = params.toString();
  return query ? `/blog?${query}` : '/blog';
}

export function BlogFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag') ?? '';
  const queryFromUrl = searchParams.get('q') ?? '';
  const pageFromUrl = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [searchInput, setSearchInput] = useState(queryFromUrl);

  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next === queryFromUrl) return;
      router.replace(blogHref({ q: next, tag: activeTag, page: 1 }), { scroll: false });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput, queryFromUrl, activeTag, router]);

  const { data, isLoading, isError, isFetching } = usePublicArticles({
    page: pageFromUrl,
    limit: PAGE_SIZE,
    q: queryFromUrl || undefined,
    tag: activeTag || undefined,
  });

  const { data: tagSource } = usePublicArticles({ page: 1, limit: 100 });
  const tagNames = useMemo(() => {
    const names = new Set<string>();
    for (const article of tagSource?.data ?? []) {
      for (const tag of article.tags) names.add(tag.name);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [tagSource]);

  function selectTag(tag: string) {
    router.replace(blogHref({ q: queryFromUrl, tag, page: 1 }), { scroll: false });
  }

  function setPage(page: number) {
    router.replace(blogHref({ q: queryFromUrl, tag: activeTag, page }), {
      scroll: false,
    });
  }

  const articles = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const filtered = Boolean(queryFromUrl || activeTag);
  const showSkeletons = isLoading || (isFetching && articles.length === 0);

  return (
    <main className={`py-12 ${pageGutter}`}>
      <h1 className="font-display text-4xl font-bold text-foreground">Latest Articles</h1>
      <p className="mt-2 text-muted-foreground">
        Published stories from Wordnest authors.
      </p>

      {tagNames.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectTag('')}
            aria-pressed={activeTag === ''}
            className={`rounded-pill px-4 py-2 text-sm ${
              activeTag === ''
                ? 'bg-button-primary text-button-primary-foreground'
                : 'bg-surface-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {tagNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => selectTag(name)}
              aria-pressed={activeTag.toLowerCase() === name.toLowerCase()}
              className={`rounded-pill px-4 py-2 text-sm ${
                activeTag.toLowerCase() === name.toLowerCase()
                  ? 'bg-button-primary text-button-primary-foreground'
                  : 'bg-surface-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="mt-6 max-w-md"
        onSubmit={(event) => {
          event.preventDefault();
          router.replace(blogHref({ q: searchInput.trim(), tag: activeTag, page: 1 }), {
            scroll: false,
          });
        }}
      >
        <label htmlFor="blog-search" className="sr-only">
          Search articles
        </label>
        <input
          id="blog-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search articles…"
          className="h-11 w-full rounded-pill border border-border bg-background px-5 text-sm text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none"
        />
      </form>

      <div className="mt-6 divide-y divide-border">
        {showSkeletons ? (
          <output aria-busy="true" className="block divide-y divide-border">
            <span className="sr-only">Loading articles…</span>
            {Array.from({ length: 4 }, (_, index) => (
              <ArticleCardSkeleton key={index} />
            ))}
          </output>
        ) : null}

        {isError ? (
          <p className="py-8 text-sm text-red-600" role="alert">
            Could not load articles. Check that the API is running, then try again.
          </p>
        ) : null}

        {!showSkeletons && !isError && articles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-xl font-bold text-foreground">
              {filtered ? 'No articles found.' : 'No articles yet.'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {filtered
                ? 'Try changing your search or filters.'
                : 'Check back soon for new stories.'}
            </p>
            {filtered ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => router.replace('/blog')}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : null}

        {!showSkeletons
          ? articles.map((article) => <ArticleCard key={article.id} article={article} />)
          : null}
      </div>

      {!showSkeletons && totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pageFromUrl <= 1 || isFetching}
            onClick={() => setPage(Math.max(pageFromUrl - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pageFromUrl} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pageFromUrl >= totalPages || isFetching}
            onClick={() => setPage(Math.min(pageFromUrl + 1, totalPages))}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </main>
  );
}
