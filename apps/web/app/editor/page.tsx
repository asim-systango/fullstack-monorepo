'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { EditorGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { isPublished } from '@/lib/api/studio';
import { useStudioArticles } from '@/hooks/use-studio';

const EDITOR_NAV = [
  { href: '/editor', label: 'Overview' },
  { href: '/editor', label: 'Articles to Publish' },
];

function EditorDashboardContent() {
  const { data, isLoading } = useStudioArticles();
  const { pending, published, totalArticles } = useMemo(() => {
    const articles = data?.data ?? [];
    return {
      pending: articles.filter((a) => !isPublished(a)),
      published: articles.filter((a) => isPublished(a)),
      totalArticles: articles.length,
    };
  }, [data]);

  return (
    <DashboardShell
      title="Editor Dashboard"
      subtitle="Review author drafts and publish approved revisions."
      role="staff"
      navItems={EDITOR_NAV}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting review" value={pending.length} />
        <StatCard label="Published" value={published.length} />
        <StatCard label="Total articles" value={totalArticles} />
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Articles to Publish</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : null}
        {!isLoading && pending.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No drafts waiting for publication.
          </p>
        ) : null}
        {!isLoading && pending.length > 0 ? (
          <div className="mt-4 divide-y divide-border rounded-lg border border-border">
            {pending.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-foreground">{article.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {new Date(article.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/editor/articles/${article.id}`}
                    className="inline-flex h-9 items-center rounded-pill border border-border-strong px-4 text-sm no-underline hover:bg-surface-muted"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/editor/articles/${article.id}`}
                    className="inline-flex h-9 items-center rounded-pill bg-brand px-4 text-sm font-medium text-brand-foreground no-underline hover:bg-brand-hover"
                  >
                    Publish
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </DashboardShell>
  );
}

function StatCard({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function EditorPage() {
  return (
    <EditorGuard>
      <EditorDashboardContent />
    </EditorGuard>
  );
}
