'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ArticleReader, toContentBlocks } from '@/components/article';
import { Button, ConfirmDialog } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import {
  getPublishedRevisionIndex,
  getRevisionLabel,
  getSubmittedRevisionIndex,
  type StudioArticleDetail,
} from '@/lib/api/studio';
import type { GatewayRole } from '@/lib/auth/roles';
import { formatLongDate, formatRelativeTime } from '@/lib/format/date';
import { usePublishArticle, useStudioArticle } from '@/hooks/use-studio';

type NavItem = { href: string; label: string };

type ArticleReviewViewProps = {
  id: string;
  /** Drives the workspace chrome only — the API enforces who may publish. */
  role: GatewayRole;
  navItems: readonly NavItem[];
  backHref: string;
  backLabel?: string;
  /** Editors also get an edit surface; admins review and publish only. */
  editHref?: string;
};

function RevisionSelector({
  article,
  selectedId,
  onSelect,
}: Readonly<{
  article: StudioArticleDetail;
  selectedId: string | undefined;
  onSelect: (revisionId: string) => void;
}>) {
  if (article.revisions.length < 2) return null;

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Revision
      <select
        value={selectedId ?? ''}
        onChange={(event) => onSelect(event.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-border-strong focus:outline-none"
      >
        {article.revisions.map((revision, index) => (
          <option key={revision.id} value={revision.id}>
            {getRevisionLabel(index)}
            {revision.id === article.submittedRevisionId ? ' (submitted)' : ''}
            {revision.id === article.publishedRevisionId ? ' (live)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Read a revision, then move the public pointer to it. Shared by the editor
 * queue and the admin article list so both roles publish through the same
 * confirmation flow and the same `POST /articles/:id/publish` call.
 */
export function ArticleReviewView({
  id,
  role,
  navItems,
  backHref,
  backLabel = 'Back',
  editHref,
}: Readonly<ArticleReviewViewProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: article, isLoading, isError, error } = useStudioArticle(id);
  const publishMutation = usePublishArticle();

  const [selectedRevisionId, setSelectedRevisionId] = useState<string | undefined>(
    () => searchParams.get('revision') ?? undefined,
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  if (isLoading) {
    return (
      <DashboardShell title="Review Article" role={role} navItems={navItems}>
        <p className="text-sm text-muted-foreground">Loading article…</p>
      </DashboardShell>
    );
  }

  if (isError || !article) {
    const notFound = error instanceof ApiClientError && error.statusCode === 404;
    return (
      <DashboardShell title="Review Article" role={role} navItems={navItems}>
        <p className="text-sm text-red-600" role="alert">
          {notFound
            ? 'This article does not exist or was deleted.'
            : 'Could not load this article.'}
        </p>
        <Link href={backHref} className="mt-4 inline-block text-sm underline">
          {backLabel}
        </Link>
      </DashboardShell>
    );
  }

  const publishedIndex = getPublishedRevisionIndex(article);
  const submittedIndex = getSubmittedRevisionIndex(article);
  // Open on exactly what the author submitted, even when newer drafts exist.
  const defaultIndex =
    submittedIndex >= 0 ? submittedIndex : article.revisions.length - 1;
  const selectedIndex = article.revisions.findIndex((r) => r.id === selectedRevisionId);
  const revisionIndex = selectedIndex >= 0 ? selectedIndex : defaultIndex;
  const revision = article.revisions[revisionIndex];
  const revisionLabel = revision ? getRevisionLabel(revisionIndex) : '—';
  const isLive = revision !== undefined && article.publishedRevisionId === revision.id;
  const isSubmitted =
    revision !== undefined && article.submittedRevisionId === revision.id;
  const newerThanSubmitted =
    submittedIndex >= 0 && submittedIndex < article.revisions.length - 1;

  async function handlePublish() {
    if (!revision) return;

    setPublishError(null);
    try {
      await publishMutation.mutateAsync({ articleId: id, revisionId: revision.id });
      setShowConfirm(false);
      setStatus(`Published ${revisionLabel}. It is now live on the blog.`);
      router.push(backHref);
    } catch (err) {
      setPublishError(err instanceof ApiClientError ? err.message : 'Publish failed.');
    }
  }

  return (
    <DashboardShell
      title={article.title}
      subtitle="Review the revision before making it publicly visible."
      role={role}
      navItems={navItems}
      actions={
        <>
          <Link
            href={backHref}
            className="inline-flex h-10 items-center px-4 text-sm text-muted-foreground no-underline hover:text-foreground hover:underline"
          >
            {backLabel}
          </Link>
          {editHref ? (
            <Link
              href={editHref}
              className="inline-flex h-10 items-center rounded-pill border border-border-strong px-5 text-sm text-foreground no-underline hover:bg-surface-muted"
            >
              Edit
            </Link>
          ) : null}
          <Button
            type="button"
            variant="brand"
            disabled={!revision}
            onClick={() => {
              setPublishError(null);
              setShowConfirm(true);
            }}
          >
            Publish
          </Button>
        </>
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-muted/40 p-4">
        <div className="text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Reviewing {revisionLabel}</span>
            {isSubmitted ? ' · submitted by the author' : ''}
            {isLive ? ' · currently live' : ''}
          </p>
          <p className="mt-1">
            {submittedIndex >= 0 && article.submittedAt
              ? `Author submitted ${getRevisionLabel(submittedIndex)} on ${formatLongDate(article.submittedAt)}.`
              : 'The author has not submitted this article for review.'}
          </p>
          {newerThanSubmitted ? (
            <p className="mt-1">
              The author has written newer revisions since submitting. They are not part
              of this review.
            </p>
          ) : null}
          <p className="mt-1">
            {publishedIndex >= 0 && article.publishedAt
              ? `Public blog is serving ${getRevisionLabel(publishedIndex)}, published ${formatLongDate(article.publishedAt)}.`
              : 'This article has never been published.'}
          </p>
          <p className="mt-1">
            /{article.slug} · Author {article.authorId.slice(0, 8)} · Updated{' '}
            {formatRelativeTime(article.updatedAt)}
          </p>
        </div>

        <RevisionSelector
          article={article}
          selectedId={revision?.id}
          onSelect={setSelectedRevisionId}
        />
      </div>

      {status ? (
        <output className="mb-6 block text-sm text-brand">{status}</output>
      ) : null}

      <div className="rounded-lg border border-border p-6 md:p-10">
        <ArticleReader
          title={article.title}
          blocks={toContentBlocks(revision?.content ?? [])}
          media={revision?.media ?? []}
          tags={article.tags}
          meta={<span>{revisionLabel} · Not a public URL</span>}
        />
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Publish Article?"
        description="You are about to make this revision publicly visible."
        details={
          <>
            <p className="text-muted-foreground">Article</p>
            <p className="font-medium text-foreground">{article.title}</p>
            <p className="mt-3 text-muted-foreground">Revision</p>
            <p className="font-medium text-foreground">{revisionLabel}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              After publishing, this revision becomes the live version of the article.
              Newer drafts stay private until you publish them too.
            </p>
          </>
        }
        confirmLabel="Publish"
        confirmVariant="brand"
        loading={publishMutation.isPending}
        error={publishError}
        onConfirm={handlePublish}
        onCancel={() => setShowConfirm(false)}
      />
    </DashboardShell>
  );
}
