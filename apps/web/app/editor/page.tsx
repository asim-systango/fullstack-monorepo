'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { EditorGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import {
  isAwaitingReview,
  isPublished,
  type StudioArticleListItem,
} from '@/lib/api/studio';
import { formatDate } from '@/lib/format/date';
import { useStudioArticles } from '@/hooks/use-studio';

const EDITOR_NAV = [
  { href: '/editor', label: 'Review Queue' },
  { href: '/editor/tags', label: 'Tags' },
];

const actionLink =
  'inline-flex h-9 items-center rounded-pill border border-border-strong px-4 text-sm text-foreground no-underline hover:bg-surface-muted';

function StatCard({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function SubmittedArticleRow({ article }: Readonly<{ article: StudioArticleListItem }>) {
  const revised = isPublished(article);

  return (
    <li className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-medium text-foreground">{article.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>Author: {article.authorId}</span>
          {article.submittedAt ? (
            <span>Submitted {formatDate(article.submittedAt)}</span>
          ) : null}
          {/* The editor reviews the submitted revision, not necessarily the newest. */}
          {article.submittedRevisionNumber !== null ? (
            <span>Submitted revision v{article.submittedRevisionNumber}</span>
          ) : null}
          {article.submittedRevisionNumber !== null &&
          article.submittedRevisionNumber < article.revisionCount ? (
            <span>Author has since written v{article.revisionCount}</span>
          ) : null}
          {revised ? (
            <span className="rounded-pill bg-accent-yellow/30 px-3 py-1 text-xs text-foreground">
              Update to a published article
            </span>
          ) : null}
        </div>
        {article.tags.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {article.tags.map((tag) => tag.name).join(' · ')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/editor/articles/${article.id}`} className={actionLink}>
          Review
        </Link>
      </div>
    </li>
  );
}

function EditorDashboardContent() {
  const { data, isLoading, isError } = useStudioArticles();

  const { awaitingReview, publishedCount, draftCount, total } = useMemo(() => {
    const articles = data?.data ?? [];
    return {
      // Only what an author explicitly submitted, never every draft.
      awaitingReview: articles.filter(isAwaitingReview),
      publishedCount: articles.filter(isPublished).length,
      draftCount: articles.filter((article) => !isPublished(article)).length,
      total: articles.length,
    };
  }, [data]);

  return (
    <DashboardShell
      title="Editor Dashboard"
      subtitle="Review the revisions authors submitted and publish the ones that are ready."
      role="staff"
      navItems={EDITOR_NAV}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={awaitingReview.length} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={draftCount} />
        <StatCard label="Total articles" value={total} />
      </div>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground">
          Articles Awaiting Review
        </h2>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading articles…</p>
        ) : null}

        {isError ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            Could not load articles. Check that the API is running, then try again.
          </p>
        ) : null}

        {!isLoading && !isError && awaitingReview.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No author has submitted an article for review right now.
            </p>
          </div>
        ) : null}

        {awaitingReview.length > 0 ? (
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {awaitingReview.map((article) => (
              <SubmittedArticleRow key={article.id} article={article} />
            ))}
          </ul>
        ) : null}
      </section>
    </DashboardShell>
  );
}

export default function EditorPage() {
  return (
    <EditorGuard>
      <EditorDashboardContent />
    </EditorGuard>
  );
}
