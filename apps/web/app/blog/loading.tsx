import { pageGutter } from '@/components/home/page-gutter';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
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
    </div>
  );
}
