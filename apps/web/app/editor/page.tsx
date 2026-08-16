'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Pagination } from '@/components/admin/pagination';
import { AsyncListState } from '@/components/admin/data-states';
import { EditorGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, ConfirmDialog } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { isPublished, type StudioArticleListItem } from '@/lib/api/studio';
import { formatDate } from '@/lib/format/date';
import { useMe } from '@/hooks/use-auth';
import { useArticleStats, useDeleteArticle, useStudioArticles } from '@/hooks/use-studio';

const EDITOR_NAV = [
  { href: '/editor', label: 'Review Queue' },
  { href: '/studio', label: 'Articles' },
  { href: '/editor/tags', label: 'Tags' },
];

const PAGE_SIZE = 20;

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

function SubmittedArticleRow({
  article,
  isOwn,
  onDelete,
}: Readonly<{
  article: StudioArticleListItem;
  isOwn: boolean;
  onDelete: () => void;
}>) {
  const revised = isPublished(article);

  return (
    <li className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-medium text-foreground">{article.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>Author {article.authorId.slice(0, 8)}</span>
          {article.submittedAt ? (
            <span>Submitted {formatDate(article.submittedAt)}</span>
          ) : null}
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
          {isOwn ? (
            <span className="rounded-pill bg-accent-yellow/30 px-3 py-1 text-xs text-foreground">
              Yours — another editor must publish
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
        <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </li>
  );
}

function EditorDashboardContent() {
  const { data: user } = useMe();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<StudioArticleListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const stats = useArticleStats();
  const { data, isLoading, isError, isFetching } = useStudioArticles({
    status: 'review',
    page,
    limit: PAGE_SIZE,
  });
  const deleteMutation = useDeleteArticle();

  const awaitingReview = data?.data ?? [];

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
      title="Editor Dashboard"
      subtitle="Review submitted revisions and publish them. You cannot publish an article you authored."
      role="staff"
      navItems={EDITOR_NAV}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={stats.data?.pendingReview ?? 0} />
        <StatCard label="Published" value={stats.data?.published ?? 0} />
        <StatCard label="Drafts" value={stats.data?.drafts ?? 0} />
        <StatCard label="Total articles" value={stats.data?.total ?? 0} />
      </div>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground">
          Articles Awaiting Review
        </h2>

        <AsyncListState
          isLoading={isLoading}
          isError={isError}
          isEmpty={awaitingReview.length === 0}
          errorLabel="Could not load articles. Check that the API is running, then try again."
          emptyLabel="Nothing is waiting for review right now."
        />

        {awaitingReview.length > 0 ? (
          <>
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
              {awaitingReview.map((article) => (
                <SubmittedArticleRow
                  key={article.id}
                  article={article}
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
      </section>

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

export default function EditorPage() {
  return (
    <EditorGuard>
      <EditorDashboardContent />
    </EditorGuard>
  );
}
