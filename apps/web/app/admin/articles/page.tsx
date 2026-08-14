'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ADMIN_NAV, AsyncListState, Pagination, useUserNames } from '@/components/admin';
import { AdminGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ReviewStatusBadge } from '@/components/studio/review-status';
import { Button, ConfirmDialog, Select, Toggle } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import {
  getReviewState,
  isDeleted,
  isPublished,
  type StudioArticleFilters,
  type StudioArticleListItem,
} from '@/lib/api/studio';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import { useDeleteArticle, useStudioArticles } from '@/hooks/use-studio';

const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 300;

type StatusOption = NonNullable<StudioArticleFilters['status']> | 'all';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Drafts' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
];

const actionLink =
  'inline-flex h-9 items-center rounded-pill border border-border-strong px-4 text-sm text-foreground no-underline hover:bg-surface-muted';

function MetaField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function ArticleRow({
  article,
  authorName,
  onDelete,
}: Readonly<{
  article: StudioArticleListItem;
  authorName: string;
  onDelete: () => void;
}>) {
  const published = isPublished(article);
  const deleted = isDeleted(article);

  return (
    <li className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground">
            {article.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <ReviewStatusBadge state={getReviewState(article)} />
            {deleted ? (
              <span className="rounded-pill bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                Deleted
              </span>
            ) : null}
            <span>{authorName}</span>
            <span>/{article.slug}</span>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            <MetaField
              label="Revisions"
              value={`${article.revisionCount}${
                article.publishedRevisionNumber !== null
                  ? ` · live v${article.publishedRevisionNumber}`
                  : ' · none live'
              }`}
            />
            <MetaField label="Created" value={formatDate(article.createdAt)} />
            <MetaField label="Updated" value={formatRelativeTime(article.updatedAt)} />
            <MetaField
              label="Published"
              value={article.publishedAt ? formatDate(article.publishedAt) : '—'}
            />
          </dl>

          {article.tags.length > 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {article.tags.map((tag) => tag.name).join(' · ')}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {published && !deleted ? (
            <Link href={`/blog/${article.slug}`} className={actionLink}>
              View
            </Link>
          ) : null}
          {deleted ? null : (
            <Link href={`/admin/articles/${article.id}`} className={actionLink}>
              Review
            </Link>
          )}
          {deleted ? null : (
            <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function AdminArticlesContent() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusOption>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StudioArticleListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filtering happens on the API so counts and pages stay correct at any size.
  const { data, isLoading, isError, isFetching } = useStudioArticles({
    page,
    limit: PAGE_SIZE,
    status: status === 'all' ? undefined : status,
    q: search || undefined,
    includeDeleted: includeDeleted || undefined,
  });
  const deleteMutation = useDeleteArticle();
  const authorName = useUserNames();

  const articles = data?.data ?? [];
  const filtered = status !== 'all' || search !== '' || includeDeleted;

  function clearFilters() {
    setStatus('all');
    setSearchInput('');
    setSearch('');
    setIncludeDeleted(false);
    setPage(1);
  }

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
      title="Articles"
      subtitle="Every article on the platform, whoever wrote it."
      role="admin"
      navItems={ADMIN_NAV}
    >
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Search titles</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title"
            className="h-10 w-64 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none"
          />
        </label>

        <div className="w-48">
          <Select
            name="status"
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(event) => {
              setStatus(event.target.value as StatusOption);
              setPage(1);
            }}
          />
        </div>

        <Toggle
          label="Include deleted"
          checked={includeDeleted}
          className="h-10"
          onCheckedChange={(next) => {
            setIncludeDeleted(next);
            setPage(1);
          }}
        />

        {filtered ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <AsyncListState
        isLoading={isLoading}
        isError={isError}
        isEmpty={articles.length === 0}
        errorLabel="Could not load articles. Check that the API is running, then try again."
        emptyLabel={
          filtered
            ? 'No articles match these filters.'
            : 'No articles have been created yet.'
        }
        emptyAction={
          filtered ? (
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null
        }
      />

      {articles.length > 0 ? (
        <>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                authorName={authorName(article.authorId)}
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
        description="The article disappears from the public blog and every listing. Its revision history is kept, so this can be audited later."
        details={
          pendingDelete ? (
            <>
              <p className="font-medium text-foreground">{pendingDelete.title}</p>
              <p className="mt-1 text-muted-foreground">
                {authorName(pendingDelete.authorId)} · /{pendingDelete.slug}
              </p>
            </>
          ) : null
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

export default function AdminArticlesPage() {
  return (
    <AdminGuard>
      <AdminArticlesContent />
    </AdminGuard>
  );
}
