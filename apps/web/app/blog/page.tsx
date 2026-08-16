import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/home';
import { pageGutter } from '@/components/home/page-gutter';
import { BlogFeed } from './blog-feed';

export const metadata: Metadata = {
  title: 'Blog — Wordnest',
  description: 'Published stories from Wordnest authors. Search and filter by tag.',
  alternates: { canonical: '/blog' },
};

function BlogFallback() {
  return (
    <main className={`py-12 ${pageGutter}`}>
      <output aria-busy="true" className="block space-y-6">
        <span className="sr-only">Loading articles…</span>
        <span className="block h-10 w-64 animate-pulse rounded bg-surface-muted" />
        <span className="block h-4 w-80 animate-pulse rounded bg-surface-muted" />
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className="block h-28 animate-pulse rounded-lg border border-border bg-surface-muted/60"
          />
        ))}
      </output>
    </main>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Suspense fallback={<BlogFallback />}>
        <BlogFeed />
      </Suspense>
    </div>
  );
}
