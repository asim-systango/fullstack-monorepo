'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/home';
import { pageGutter } from '@/components/home/page-gutter';
import { usePublicArticles } from '@/hooks/use-public-articles';

export default function BlogPage() {
  const { data, isLoading } = usePublicArticles({ page: 1, limit: 20 });
  const articles = data?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className={`py-12 ${pageGutter}`}>
        <h1 className="font-display text-4xl font-bold text-foreground">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Published stories from Wordnest authors.
        </p>

        <div className="mt-10 divide-y divide-border">
          {isLoading ? (
            <p className="py-8 text-sm text-muted-foreground">Loading…</p>
          ) : null}
          {!isLoading && articles.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              No published articles yet.
            </p>
          ) : null}
          {!isLoading && articles.length > 0
            ? articles.map((article) => (
                <article key={article.id} className="py-8">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="font-display text-2xl font-bold text-foreground no-underline hover:underline"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </article>
              ))
            : null}
        </div>
      </main>
    </div>
  );
}
