'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, ConfirmDialog } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import {
  getReviewState,
  isAwaitingReview,
  isPublished,
  type StudioArticleListItem,
} from '@/lib/api/studio';
import { REVIEW_STATE_COPY, ReviewStatusBadge } from '@/components/studio/review-status';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { useDeleteArticle, useStudioArticles } from '@/hooks/use-studio';

const STUDIO_NAV = [
  { href: '/studio', label: 'My Articles' },
  { href: '/studio/new', label: 'Create Article' },
];

const TABS = [
  { key: 'drafts', label: 'Drafts' },
  { key: 'review', label: 'In Review' },
  { key: 'published', label: 'Published' },
  { key: 'all', label: 'All' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const EMPTY_COPY: Record<TabKey, string> = {
  drafts: 'No drafts here yet.',
  review: 'You have not submitted anything for review.',
  published: 'None of your articles are published yet.',
  all: 'No articles here yet.',
};

const actionLink =
  'inline-flex h-9 items-center rounded-pill border border-border-strong px-4 text-sm text-foreground no-underline hover:bg-surface-muted';

function ArticleCard({
  article,
  onDelete,
}: Readonly<{ article: StudioArticleListItem; onDelete: () => void }>) {
  const published = isPublished(article);
  const state = getReviewState(article);
  const { note } = REVIEW_STATE_COPY[state];

  return (
    <li className="rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground">
            <Link
              href={`/studio/${article.id}`}
              className="text-foreground no-underline hover:underline"
            >
              {article.title}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <ReviewStatusBadge state={state} />
            <span>Revision v{Math.max(article.revisionCount, 1)}</span>
            <span>/{article.slug}</span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {published && article.publishedAt
              ? `Published ${formatDate(article.publishedAt)}`
              : `Updated ${formatRelativeTime(article.updatedAt)}`}
          </p>

          {article.submittedAt ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted {formatRelativeTime(article.submittedAt)}
            </p>
          ) : null}

          {note ? <p className="mt-1 text-sm text-body">{note}</p> : null}

          {article.tags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded-pill bg-surface-muted px-3 py-1 text-xs text-body"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Authors never get a Publish action — only an Editor can move the pointer. */}
        <div className="flex flex-wrap items-center gap-2">
          {published ? (
            <Link href={`/blog/${article.slug}`} className={actionLink}>
              View
            </Link>
          ) : (
            <Link href={`/studio/${article.id}/preview`} className={actionLink}>
              Preview
            </Link>
          )}
          <Link href={`/studio/${article.id}`} className={actionLink}>
            Edit
          </Link>
          <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </li>
  );
}

function StudioContent() {
  const { data, isLoading, isError } = useStudioArticles();
  const deleteMutation = useDeleteArticle();
  const [tab, setTab] = useState<TabKey>('drafts');
  const [pendingDelete, setPendingDelete] = useState<StudioArticleListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { byTab, counts } = useMemo(() => {
    const articles = data?.data ?? [];
    // "In Review" cuts across the draft/published split: a published article
    // can have a newer revision sitting with an editor.
    const groups = {
      drafts: articles.filter(
        (article) => !isPublished(article) && !isAwaitingReview(article),
      ),
      review: articles.filter(isAwaitingReview),
      published: articles.filter(isPublished),
      all: articles,
    } satisfies Record<TabKey, StudioArticleListItem[]>;

    return {
      byTab: groups,
      counts: {
        drafts: groups.drafts.length,
        review: groups.review.length,
        published: groups.published.length,
        all: groups.all.length,
      } satisfies Record<TabKey, number>,
    };
  }, [data]);

  const filtered = byTab[tab];

  async function handleDelete() {
    if (!pendingDelete) return;

    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiClientError ? err.message : 'Could not delete article.',
      );
    }
  }

  return (
    <DashboardShell
      title="My Articles"
      subtitle="Write drafts and save revisions. An Editor publishes your work."
      role="user"
      navItems={STUDIO_NAV}
      actions={
        <Link
          href="/studio/new"
          className="inline-flex h-10 items-center justify-center rounded-pill bg-button-primary px-5 text-sm font-medium text-button-primary-foreground no-underline hover:bg-foreground"
        >
          + Create Article
        </Link>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`rounded-pill px-4 py-2 text-sm ${
              tab === key
                ? 'bg-button-primary text-button-primary-foreground'
                : 'bg-surface-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading articles…</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          Could not load your articles. Check that the API is running, then try again.
        </p>
      ) : null}

      {!isLoading && !isError && filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">{EMPTY_COPY[tab]}</p>
          <Link href="/studio/new" className="mt-4 inline-block text-sm underline">
            Create an article
          </Link>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <ul className="space-y-4">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onDelete={() => {
                setDeleteError(null);
                setPendingDelete(article);
              }}
            />
          ))}
        </ul>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Article?"
        description="This article will be removed from the public blog. Your revision history is kept."
        details={
          pendingDelete ? <p className="font-medium">{pendingDelete.title}</p> : null
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
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
