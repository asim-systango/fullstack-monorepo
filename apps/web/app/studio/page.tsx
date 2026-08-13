'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { isPublished, type StudioArticleListItem } from '@/lib/api/studio';
import { useStudioArticles } from '@/hooks/use-studio';

const STUDIO_NAV = [
  { href: '/studio', label: 'My Articles' },
  { href: '/studio/new', label: 'Create Article' },
];

function ArticleRow({ article }: Readonly<{ article: StudioArticleListItem }>) {
  const status = isPublished(article) ? 'Published' : 'Draft';
  const statusClass = isPublished(article)
    ? 'bg-brand/10 text-brand'
    : 'bg-surface-muted text-muted-foreground';

  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link
          href={`/studio/${article.id}`}
          className="font-medium text-foreground no-underline hover:underline"
        >
          {article.title}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          /{article.slug} · Updated {new Date(article.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-pill px-3 py-1 text-xs font-medium ${statusClass}`}>
          {status}
        </span>
        <Link
          href={`/studio/${article.id}`}
          className="text-sm text-foreground underline underline-offset-2"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

function StudioContent() {
  const { data, isLoading } = useStudioArticles();
  const [tab, setTab] = useState<'all' | 'drafts' | 'published'>('all');

  const articles = data?.data ?? [];
  const filtered = useMemo(() => {
    if (tab === 'drafts') return articles.filter((a) => !isPublished(a));
    if (tab === 'published') return articles.filter((a) => isPublished(a));
    return articles;
  }, [articles, tab]);

  return (
    <DashboardShell
      title="Author Studio"
      subtitle="Create drafts and revisions. An Editor publishes your work."
      role="user"
      navItems={STUDIO_NAV}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['all', 'drafts', 'published'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-pill px-4 py-2 text-sm capitalize ${
                tab === key
                  ? 'bg-button-primary text-button-primary-foreground'
                  : 'bg-surface-muted text-muted-foreground'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <Link
          href="/studio/new"
          className="inline-flex h-10 items-center justify-center rounded-pill bg-button-primary px-5 text-sm font-medium text-button-primary-foreground no-underline hover:bg-foreground"
        >
          + Create Article
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading articles…</p>
      ) : null}
      {!isLoading && filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No articles yet.</p>
          <Link href="/studio/new" className="mt-4 inline-block text-sm underline">
            Create your first article
          </Link>
        </div>
      ) : null}
      {!isLoading && filtered.length > 0 ? (
        <div>
          {filtered.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </DashboardShell>
  );
}

export default function StudioPage() {
  return (
    <StudioGuard>
      <StudioContent />
    </StudioGuard>
  );
}
