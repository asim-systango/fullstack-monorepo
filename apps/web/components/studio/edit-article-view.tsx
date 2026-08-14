'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, ConfirmDialog, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import {
  getLatestRevision,
  getPublishedRevisionIndex,
  getReviewState,
  getRevisionLabel,
  getSubmittedRevisionIndex,
  hasUnpublishedChanges,
  toReviewPointers,
  type ArticleReviewState,
  type StudioArticleDetail,
} from '@/lib/api/studio';
import type { GatewayRole } from '@/lib/auth/roles';
import { formatDate, formatRelativeTime } from '@/lib/format/date';
import {
  useCreateRevision,
  useStudioArticle,
  useSubmitForReview,
  useUpdateArticle,
} from '@/hooks/use-studio';
import { StoryEditor } from './story-editor';
import { TagPicker } from './tag-picker';
import { REVIEW_STATE_COPY, ReviewStatusBadge } from './review-status';
import { fromArticleContent, toArticleContent, type StoryBlock } from './story-blocks';

const FORM_ID = 'edit-article-form';

type EditArticleViewProps = {
  id: string;
  role: GatewayRole;
  navItems: readonly { href: string; label: string }[];
  /** Where Cancel and the not-found fallback return to. */
  backHref: string;
  backLabel: string;
  previewHref: string;
};

function RevisionSummary({ article }: Readonly<{ article: StudioArticleDetail }>) {
  const latestLabel = getRevisionLabel(article.revisions.length - 1);
  const publishedIndex = getPublishedRevisionIndex(article);
  const submittedIndex = getSubmittedRevisionIndex(article);
  const state = getReviewState(toReviewPointers(article));
  const { note } = REVIEW_STATE_COPY[state];

  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-medium text-foreground">Revision: {latestLabel}</p>
        <ReviewStatusBadge state={state} />
      </div>
      <p className="mt-2 text-muted-foreground">
        {publishedIndex >= 0
          ? `Live on the blog: ${getRevisionLabel(publishedIndex)}`
          : 'Not published yet.'}
      </p>
      {submittedIndex >= 0 && article.submittedAt ? (
        <p className="mt-1 text-muted-foreground">
          Submitted for review: {getRevisionLabel(submittedIndex)} ·{' '}
          {formatRelativeTime(article.submittedAt)}
        </p>
      ) : null}
      {note ? <p className="mt-1 text-body">{note}</p> : null}
      {hasUnpublishedChanges(article) ? (
        <p className="mt-1 text-muted-foreground">
          Newer revisions stay private until an Editor publishes them.
        </p>
      ) : null}
    </div>
  );
}

function RevisionHistory({ article }: Readonly<{ article: StudioArticleDetail }>) {
  const submittedIndex = getSubmittedRevisionIndex(article);
  const publishedIndex = getPublishedRevisionIndex(article);

  return (
    <section className="max-w-2xl">
      <h2 className="font-display text-lg font-bold text-foreground">Revision History</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Saving always appends a new revision. Older ones stay as history.
      </p>
      <ol className="mt-4 divide-y divide-border rounded-lg border border-border">
        {[...article.revisions].reverse().map((revision, reversedIndex) => {
          const index = article.revisions.length - 1 - reversedIndex;
          const submitted = index === submittedIndex;
          const live = index === publishedIndex;

          return (
            <li key={revision.id} className="px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{getRevisionLabel(index)}</p>
              <p className="mt-1 text-muted-foreground">
                {submitted && article.submittedAt
                  ? `Submitted for review · ${formatDate(article.submittedAt)}`
                  : `Created ${formatDate(revision.createdAt)}`}
                {live ? ' · live on the blog' : ''}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** States where the author still has something new to hand to an editor. */
const SUBMITTABLE_STATES: ReadonlySet<ArticleReviewState> = new Set([
  'draft',
  'changes-after-submit',
  'published-with-draft',
]);

/**
 * Shared edit surface for the Author studio and the Editor workspace.
 * Saving always appends a revision — it never overwrites the current one and
 * never changes what the public blog serves.
 */
export function EditArticleView({
  id,
  role,
  navItems,
  backHref,
  backLabel,
  previewHref,
}: Readonly<EditArticleViewProps>) {
  const { data: article, isLoading, isError, error } = useStudioArticle(id);
  const revisionMutation = useCreateRevision(id);
  const updateMutation = useUpdateArticle(id);
  const reviewMutation = useSubmitForReview(id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Hydrate once per article so refetching after a save never discards live edits.
  const hydratedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!article || hydratedFor.current === article.id) return;

    hydratedFor.current = article.id;
    setTitle(article.title);
    setSlug(article.slug);
    setTagIds(article.tags.map((tag) => tag.id));

    const latest = getLatestRevision(article);
    setBlocks(fromArticleContent(latest?.content ?? [], latest?.media ?? []));
  }, [article]);

  if (isLoading) {
    return (
      <DashboardShell title="Edit Article" role={role} navItems={navItems}>
        <p className="text-sm text-muted-foreground">Loading article…</p>
      </DashboardShell>
    );
  }

  if (isError || !article) {
    const notFound = error instanceof ApiClientError && error.statusCode === 404;
    return (
      <DashboardShell title="Edit Article" role={role} navItems={navItems}>
        <p className="text-sm text-red-600" role="alert">
          {notFound
            ? 'This article does not exist, was deleted, or is not available to you.'
            : 'Could not load this article.'}
        </p>
        <Link href={backHref} className="mt-4 inline-block text-sm underline">
          {backLabel}
        </Link>
      </DashboardShell>
    );
  }

  const saving = revisionMutation.isPending || updateMutation.isPending;
  const reviewState = getReviewState(toReviewPointers(article));
  // Authors and Editors both submit; publishing is always a different Editor.
  const canRequestReview =
    (role === 'user' || role === 'staff') && SUBMITTABLE_STATES.has(reviewState);
  const isPendingReview =
    (role === 'user' || role === 'staff') &&
    (reviewState === 'pending-review' || reviewState === 'published-pending-review');
  const latestLabel = getRevisionLabel(article.revisions.length - 1);
  const metadataChanged =
    title.trim() !== article.title ||
    slug.trim() !== article.slug ||
    tagIds.length !== article.tags.length ||
    tagIds.some((tagId) => !article.tags.some((tag) => tag.id === tagId));

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);
    setStatus(null);

    const content = toArticleContent(blocks);
    if (content.length === 0) {
      setFormError('Add some content before saving this revision.');
      return;
    }

    try {
      if (metadataChanged) {
        await updateMutation.mutateAsync({
          title: title.trim(),
          slug: slug.trim(),
          tagIds,
        });
      }

      const revision = await revisionMutation.mutateAsync({ content });
      setStatus(`Saved as revision v${revision.revisionNumber}. Not published yet.`);
    } catch (err) {
      setFormError(
        err instanceof ApiClientError ? err.message : 'Could not save this revision.',
      );
    }
  }

  async function handleRequestReview() {
    setReviewError(null);
    try {
      const submitted = await reviewMutation.mutateAsync();
      setReviewOpen(false);
      setStatus(
        role === 'staff'
          ? `Submitted revision v${submitted.submittedRevisionNumber} for review. Another editor must publish it.`
          : `Submitted revision v${submitted.submittedRevisionNumber} for review. An Editor will decide whether to publish it.`,
      );
    } catch (err) {
      setReviewError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not submit this article for review.',
      );
    }
  }

  return (
    <DashboardShell
      title="Edit Article"
      subtitle="Every save creates a new revision. Publishing is a separate step."
      role={role}
      navItems={navItems}
      actions={
        <>
          <Link
            href={backHref}
            className="inline-flex h-10 items-center px-4 text-sm text-muted-foreground no-underline hover:text-foreground hover:underline"
          >
            Cancel
          </Link>
          <Link
            href={previewHref}
            className="inline-flex h-10 items-center rounded-pill border border-border-strong px-5 text-sm text-foreground no-underline hover:bg-surface-muted"
          >
            Preview
          </Link>
          <Button type="submit" form={FORM_ID} variant="outline" loading={saving}>
            Save Draft
          </Button>
          {/* Authors and Editors request review. Publish lives on the review page. */}
          {canRequestReview ? (
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={() => {
                setReviewError(null);
                setReviewOpen(true);
              }}
            >
              {article.submittedRevisionId === null
                ? 'Request Review'
                : 'Request Review Again'}
            </Button>
          ) : null}
          {isPendingReview ? (
            <span className="inline-flex h-10 items-center rounded-pill bg-accent-yellow/30 px-4 text-sm text-foreground">
              Pending Review
            </span>
          ) : null}
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <RevisionSummary article={article} />

        <Input
          label="Title"
          name="title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          label="Slug"
          name="slug"
          required
          hint="Lowercase letters, numbers, and hyphens"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />

        <TagPicker
          selectedIds={tagIds}
          onChange={setTagIds}
          disabled={saving}
          allowCreate={role !== 'user'}
        />

        <div className="flex flex-col gap-1.5 pt-2">
          <p className="text-sm font-medium text-foreground">Story</p>
          <p className="text-xs text-muted-foreground">
            Use the + button to add text, headings, images, video, or code.
          </p>
          <div className="mt-2">
            <StoryEditor blocks={blocks} onBlocksChange={setBlocks} disabled={saving} />
          </div>
        </div>

        {status ? <output className="block text-sm text-brand">{status}</output> : null}

        {formError ? (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Last updated {formatRelativeTime(article.updatedAt)}
        </p>
      </form>

      <div className="mt-10">
        <RevisionHistory article={article} />
      </div>

      <ConfirmDialog
        open={reviewOpen}
        title="Request Review?"
        description={
          role === 'staff'
            ? 'Another editor must review this revision and publish it. You cannot publish an article you authored.'
            : 'An Editor will review this revision and decide whether to publish it. Nothing becomes public until they do.'
        }
        details={
          <>
            <p className="font-medium">{article.title}</p>
            <p className="text-sm text-muted-foreground">Revision: {latestLabel}</p>
            <p className="text-sm text-muted-foreground">
              Unsaved edits are not included — save a draft first if you have any.
            </p>
          </>
        }
        confirmLabel="Request Review"
        loading={reviewMutation.isPending}
        error={reviewError}
        onConfirm={handleRequestReview}
        onCancel={() => setReviewOpen(false)}
      />
    </DashboardShell>
  );
}
