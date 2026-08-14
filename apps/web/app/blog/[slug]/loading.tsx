import { pageGutter } from '@/components/home/page-gutter';

export default function BlogArticleLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className={`${pageGutter} py-16`}>
        <output aria-busy="true" className="mx-auto block max-w-content space-y-4">
          <span className="sr-only">Loading article…</span>
          <span className="block h-4 w-32 animate-pulse rounded bg-surface-muted" />
          <span className="block h-12 w-3/4 animate-pulse rounded bg-surface-muted" />
          <span className="block h-4 w-48 animate-pulse rounded bg-surface-muted" />
          <span className="mt-10 block aspect-[2/1] animate-pulse rounded-lg bg-surface-muted" />
          <span className="mt-8 block h-6 w-full animate-pulse rounded bg-surface-muted" />
          <span className="block h-6 w-5/6 animate-pulse rounded bg-surface-muted" />
          <span className="block h-6 w-2/3 animate-pulse rounded bg-surface-muted" />
        </output>
      </main>
    </div>
  );
}
