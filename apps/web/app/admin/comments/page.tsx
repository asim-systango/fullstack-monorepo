'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ADMIN_NAV, AsyncListState, Pagination, useUserNames } from '@/components/admin';
import { AdminGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, ConfirmDialog } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import type { ModerationComment } from '@/lib/api/comments';
import { formatDate } from '@/lib/format/date';
import { useModerateDeleteComment, useModerationComments } from '@/hooks/use-comments';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type Visibility = {
  label: string;
  className: string;
  /** Only publicly reachable comments have a blog URL worth linking to. */
  public: boolean;
};

/**
 * There is no status column on a comment — visibility is whatever its article's
 * pointers say, so it is derived here rather than stored.
 */
function getVisibility(article: ModerationComment['article']): Visibility {
  if (article.deletedAt !== null) {
    return {
      label: 'Article deleted',
      className: 'bg-red-100 text-red-700',
      public: false,
    };
  }
  if (article.publishedRevisionId === null) {
    return {
      label: 'Article unpublished',
      className: 'bg-accent-yellow/30 text-foreground',
      public: false,
    };
  }
  return { label: 'Public', className: 'bg-brand/10 text-brand', public: true };
}

function CommentRow({
  comment,
  authorName,
  onDelete,
}: Readonly<{
  comment: ModerationComment;
  authorName: string;
  onDelete: () => void;
}>) {
  const visibility = getVisibility(comment.article);

  return (
    <li className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm whitespace-pre-wrap text-foreground">{comment.body}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span
              className={`rounded-pill px-3 py-1 text-xs font-medium ${visibility.className}`}
            >
              {visibility.label}
            </span>
            <span>{authorName}</span>
            <span aria-hidden>·</span>
            <span>on {comment.article.title}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {visibility.public ? (
            <Link
              href={`/blog/${comment.article.slug}`}
              className="inline-flex h-9 items-center rounded-pill border border-border-strong px-4 text-sm text-foreground no-underline hover:bg-surface-muted"
            >
              View Article
            </Link>
          ) : (
            <Link
              href={`/admin/articles/${comment.article.id}`}
              className="inline-flex h-9 items-center rounded-pill border border-border-strong px-4 text-sm text-foreground no-underline hover:bg-surface-muted"
            >
              Open in Admin
            </Link>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </li>
  );
}

function AdminCommentsContent() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<ModerationComment | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = useModerationComments({
    page,
    limit: PAGE_SIZE,
    q: search || undefined,
  });
  const deleteMutation = useModerateDeleteComment();
  const authorName = useUserNames();

  const comments = data?.data ?? [];

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      setSuccess('Comment deleted.');
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiClientError ? err.message : 'Could not delete comment.',
      );
    }
  }

  return (
    <DashboardShell
      title="Comments"
      subtitle="Every comment on the platform, including those on unpublished and removed articles."
      role="admin"
      navItems={ADMIN_NAV}
    >
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Search comments</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search comment text"
            className="h-10 w-72 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none"
          />
        </label>

        {search ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {success ? (
        <output className="mb-6 block rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand">
          {success}
        </output>
      ) : null}

      <AsyncListState
        isLoading={isLoading}
        isError={isError}
        isEmpty={comments.length === 0}
        errorLabel="Could not load comments. Check that the API is running, then try again."
        emptyLabel={
          search ? 'No comments match this search.' : 'No comments have been posted yet.'
        }
        emptyAction={
          search ? (
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null
        }
      />

      {comments.length > 0 ? (
        <>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                authorName={authorName(comment.userId)}
                onDelete={() => {
                  setDeleteError(null);
                  setSuccess(null);
                  setPendingDelete(comment);
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
            label="comments"
          />
        </>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Comment?"
        description="This comment will be removed from the platform."
        details={
          pendingDelete ? (
            <>
              <p className="whitespace-pre-wrap text-foreground">{pendingDelete.body}</p>
              <p className="mt-3 text-muted-foreground">
                {authorName(pendingDelete.userId)} on {pendingDelete.article.title}
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

export default function AdminCommentsPage() {
  return (
    <AdminGuard>
      <AdminCommentsContent />
    </AdminGuard>
  );
}
