'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { Pagination } from '@/components/admin/pagination';
import { AsyncListState } from '@/components/admin/data-states';
import { StudioGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getStudioWorkspace } from '@/components/studio/studio-nav';
import { REVIEW_STATE_COPY, ReviewStatusBadge } from '@/components/studio/review-status';
import { Button, ConfirmDialog, Input, Select } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import {
  getReviewState,
  isAwaitingReview,
  isDeleted,
  isPublished,
  type StudioArticleFilters,
  type StudioArticleListItem,
} from '@/lib/api/studio';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { useMe } from '@/hooks/use-auth';
import { useArticleStats, useDeleteArticle, useStudioArticles } from '@/hooks/use-studio';
import { useTags } from '@/hooks/use-tags';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const TABS = [
  { key: 'all', label: 'All', status: undefined },
  { key: 'drafts', label: 'Drafts', status: 'draft' },
  { key: 'review', label: 'In Review', status: 'review' },
  { key: 'published', label: 'Published', status: 'published' },
  { key: 'trash', label: 'Trash', status: 'deleted' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const EMPTY_COPY: Record<TabKey, string> = {
  drafts: 'No drafts here yet.',
  review: 'Nothing is waiting for review.',
  published: 'No published articles yet.',
  all: 'No articles here yet.',
  trash: 'No deleted articles.',
};

function articleDateLine(article: StudioArticleListItem): string {
  if (isDeleted(article) && article.deletedAt) {
    return `Deleted ${formatDate(article.deletedAt)}`;
  }
  if (isPublished(article) && article.publishedAt) {
    return `Published ${formatDate(article.publishedAt)}`;
  }
  return `Updated ${formatRelativeTime(article.updatedAt)}`;
}

const actionLink =
  'inline-flex h-9 items-center rounded-pill border border-border-strong px-4 text-sm text-foreground no-underline hover:bg-surface-muted';

function ArticleCard({
  article,
  isEditor,
  isOwn,
  onDelete,
}: Readonly<{
  article: StudioArticleListItem;
  isEditor: boolean;
  isOwn: boolean;
  onDelete: () => void;
}>) {
  const deleted = isDeleted(article);
  const published = isPublished(article);
  const state = getReviewState(article);
  const { note } = REVIEW_STATE_COPY[state];

  return (
    <li className="rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground">
            {deleted ? (
              <span>{article.title}</span>
            ) : (
              <Link
                href={`/studio/${article.id}`}
                className="text-foreground no-underline hover:underline"
              >
                {article.title}
              </Link>
            )}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {deleted ? (
              <span className="rounded-pill bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                Deleted
              </span>
            ) : (
              <ReviewStatusBadge state={state} />
            )}
            <span>Revision v{Math.max(article.revisionCount, 1)}</span>
            <span>/{article.slug}</span>
            {isEditor ? <span>Author {article.authorId.slice(0, 8)}</span> : null}
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{articleDateLine(article)}</p>

          {!deleted && isAwaitingReview(article) && article.submittedAt ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted {formatRelativeTime(article.submittedAt)}
              {article.submittedRevisionNumber !== null
                ? ` · v${article.submittedRevisionNumber}`
                : ''}
            </p>
          ) : null}

          {!deleted && isEditor && isOwn && isAwaitingReview(article) ? (
            <p className="mt-1 text-sm text-body">
              You authored this article. Another editor must publish it.
            </p>
          ) : null}

          {!deleted && note ? <p className="mt-1 text-sm text-body">{note}</p> : null}

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

        {deleted ? null : (
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
            {isEditor && isAwaitingReview(article) ? (
              <Link href={`/editor/articles/${article.id}`} className={actionLink}>
                Review
              </Link>
            ) : null}
            <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

function StudioContent() {
  const { data: user } = useMe();
  const workspace = getStudioWorkspace(user?.role);

  const [tab, setTab] = useState<TabKey>('drafts');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [pendingDelete, setPendingDelete] = useState<StudioArticleListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const activeTab = TABS.find((item) => item.key === tab) ?? TABS[0];
  const filters: StudioArticleFilters = {
    page,
    limit: PAGE_SIZE,
    ...(activeTab.status ? { status: activeTab.status } : {}),
    ...(search ? { q: search } : {}),
    ...(tag ? { tag } : {}),
  };

  const { data, isLoading, isError, isFetching } = useStudioArticles(filters);
  const stats = useArticleStats();
  const tags = useTags();
  const deleteMutation = useDeleteArticle();

  const articles = data?.data ?? [];
  const counts = {
    all: stats.data?.total ?? 0,
    drafts: stats.data?.drafts ?? 0,
    review: stats.data?.pendingReview ?? 0,
    published: stats.data?.published ?? 0,
    trash: stats.data?.deleted ?? 0,
  };
  const filtered = Boolean(search || tag);
  let emptyAction: ReactNode = (
    <Link href="/studio/new" className="inline-block text-sm underline">
      Create an article
    </Link>
  );
  if (filtered) {
    emptyAction = (
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setSearchInput('');
          setSearch('');
          setTag('');
          setPage(1);
        }}
      >
        Clear filters
      </Button>
    );
  } else if (tab === 'trash') {
    emptyAction = null;
  }

  const tagOptions = [
    { value: 'all', label: 'All tags' },
    ...(tags.data?.data ?? []).map((item) => ({ value: item.name, label: item.name })),
  ];

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

  function selectTab(next: TabKey) {
    setTab(next);
    setPage(1);
  }

  return (
    <DashboardShell
      title={workspace.listTitle}
      subtitle={workspace.listSubtitle}
      role={workspace.role}
      navItems={workspace.navItems}
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
            onClick={() => selectTab(key)}
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

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input
            name="studio-search"
            label="Search"
            placeholder="Search by title"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            name="studio-tag"
            label="Tag"
            options={tagOptions}
            value={tag || 'all'}
            onChange={(event) => {
              setTag(event.target.value === 'all' ? '' : event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <AsyncListState
        isLoading={isLoading}
        isError={isError}
        isEmpty={articles.length === 0}
        errorLabel="Could not load articles. Check that the API is running, then try again."
        emptyLabel={filtered ? 'No articles match these filters.' : EMPTY_COPY[tab]}
        emptyAction={emptyAction}
      />

      {articles.length > 0 ? (
        <>
          <ul className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isEditor={workspace.isEditor}
                isOwn={Boolean(user?.id && article.authorId === user.id)}
                onDelete={() => {
                  setDeleteError(null);
                  setPendingDelete(article);
                }}
              />
            ))}
          </ul>

          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            total={data?.total ?? 0}
            pageSize={PAGE_SIZE}
            busy={isFetching}
            onPageChange={setPage}
            label="articles"
          />
        </>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Article?"
        description="This article will no longer be publicly available."
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
