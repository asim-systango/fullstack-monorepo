'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { SiteHeader } from '@/components/home';
import { pageGutter } from '@/components/home/page-gutter';
import { Button } from '@/components/ui';
import type { PublicArticleListItem } from '@/lib/api/articles';
import { formatLongDate } from '@/lib/format/date';
import { usePublicArticles } from '@/hooks/use-public-articles';

const PAGE_SIZE = 12;

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

function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag') ?? '';

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = usePublicArticles({
    page,
    limit: PAGE_SIZE,
    q: search || undefined,
    tag: activeTag || undefined,
  });

  // The tag catalogue is authenticated, so build the filter list from the
  // unfiltered public feed instead.
  const { data: tagSource } = usePublicArticles({ page: 1, limit: 100 });
  const tagNames = useMemo(() => {
    const names = new Set<string>();
    for (const article of tagSource?.data ?? []) {
      for (const tag of article.tags) names.add(tag.name);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [tagSource]);

  function selectTag(tag: string) {
    setPage(1);
    router.replace(tag ? `/blog?tag=${encodeURIComponent(tag)}` : '/blog', {
      scroll: false,
    });
  }

  const articles = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

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

      <div className="mt-6 max-w-md">
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
      </div>

      <div className="mt-6 divide-y divide-border">
        {isLoading ? (
          <p className="py-8 text-sm text-muted-foreground">Loading articles…</p>
        ) : null}

        {isError ? (
          <p className="py-8 text-sm text-red-600" role="alert">
            Could not load articles. Check that the API is running, then try again.
          </p>
        ) : null}

        {!isLoading && !isError && articles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {search || activeTag
                ? 'No published articles match this filter.'
                : 'No published articles yet.'}
            </p>
            {search || activeTag ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchInput('');
                  selectTag('');
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : null}

        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </main>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Suspense
        fallback={
          <main className={`py-12 ${pageGutter}`}>
            <p className="text-sm text-muted-foreground">Loading…</p>
          </main>
        }
      >
        <BlogContent />
      </Suspense>
    </div>
  );
}
