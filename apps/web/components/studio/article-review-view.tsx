'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ArticleReader, toContentBlocks } from '@/components/article';
import { Button, ConfirmDialog, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import {
  getPublishedRevisionIndex,
  getRevisionLabel,
  getSubmittedRevisionIndex,
  type StudioArticleDetail,
} from '@/lib/api/studio';
import type { GatewayRole } from '@/lib/auth/roles';
import {
  formatDateTime,
  formatLongDate,
  formatRelativeTime,
  toLocalOffsetIso,
} from '@/lib/format/date';
import { useMe } from '@/hooks/use-auth';
import {
  useDeleteArticle,
  usePublishArticle,
  useSchedulePublish,
  useStudioArticle,
} from '@/hooks/use-studio';

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

function defaultScheduleParts(): { date: string; time: string } {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(10, 0, 0, 0);
  const date = [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, '0'),
    String(next.getDate()).padStart(2, '0'),
  ].join('-');
  return { date, time: '10:00' };
}

function parseLocalSchedule(date: string, time: string): Date | null {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const [hours, minutes] = time.split(':').map(Number) as [number, number];
  if (![year, month, day, hours, minutes].every((part) => Number.isFinite(part))) {
    return null;
  }
  const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function localTimeZoneLabel(): string {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
  })
    .formatToParts(new Date())
    .find((part) => part.type === 'timeZoneName')?.value;
  return offset ?? zone ?? 'local time';
}

function SchedulePublishDialog({
  open,
  revisionLabel,
  date,
  time,
  loading,
  error,
  onDateChange,
  onTimeChange,
  onConfirm,
  onCancel,
}: Readonly<{
  open: boolean;
  revisionLabel: string;
  date: string;
  time: string;
  loading: boolean;
  error: string | null;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="schedule-publish-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-sm rounded-lg border border-border bg-background p-5 text-foreground shadow-lg backdrop:bg-black/40"
    >
      <h2 id="schedule-publish-title" className="font-display text-lg font-bold">
        Publish Later
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {revisionLabel} publishes at this clock time ({localTimeZoneLabel()}).
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Input
          id="schedule-date"
          label="Date"
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
        <Input
          id="schedule-time"
          label="Time"
          type="time"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
        />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" variant="brand" loading={loading} onClick={onConfirm}>
          Schedule
        </Button>
      </div>
    </dialog>
  );
}

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
 * Run Due Jobs is not shown in this view.
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
  const { data: viewer } = useMe();
  const { data: article, isLoading, isError, error } = useStudioArticle(id);
  const publishMutation = usePublishArticle();
  const scheduleMutation = useSchedulePublish();
  const deleteMutation = useDeleteArticle();

  const [selectedRevisionId, setSelectedRevisionId] = useState<string | undefined>(
    () => searchParams.get('revision') ?? undefined,
  );
  const [scheduleDate, setScheduleDate] = useState(() => defaultScheduleParts().date);
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
  const isOwnArticle = role === 'staff' && viewer?.id === article.authorId;
  const scheduledRevisionIndex = article.scheduledRevisionId
    ? article.revisions.findIndex((item) => item.id === article.scheduledRevisionId)
    : -1;
  const scheduledRevisionLabel =
    scheduledRevisionIndex >= 0 ? getRevisionLabel(scheduledRevisionIndex) : null;

  async function handlePublish() {
    if (!revision || isOwnArticle) return;

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

  async function handleSchedule() {
    if (!revision || isOwnArticle) return;

    const scheduled = parseLocalSchedule(scheduleDate, scheduleTime);
    if (!scheduled) {
      setScheduleError('Choose a valid date and time.');
      return;
    }
    if (scheduled.getTime() <= Date.now()) {
      setScheduleError('Scheduled time must be in the future.');
      return;
    }

    setScheduleError(null);
    try {
      await scheduleMutation.mutateAsync({
        articleId: id,
        revisionId: revision.id,
        scheduledAt: toLocalOffsetIso(scheduled),
      });
      setShowSchedule(false);
      setStatus(
        `Scheduled ${revisionLabel} for ${formatDateTime(toLocalOffsetIso(scheduled))}. The article stays private until then.`,
      );
    } catch (err) {
      setScheduleError(
        err instanceof ApiClientError ? err.message : 'Could not schedule publish.',
      );
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(id);
      setShowDelete(false);
      router.push(backHref);
    } catch (err) {
      setDeleteError(
        err instanceof ApiClientError ? err.message : 'Could not delete article.',
      );
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
          {isOwnArticle ? null : (
            <>
              <Button
                type="button"
                variant="brand"
                disabled={!revision}
                onClick={() => {
                  setShowSchedule(false);
                  setPublishError(null);
                  setShowConfirm(true);
                }}
              >
                Publish
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!revision}
                onClick={() => {
                  setShowConfirm(false);
                  setScheduleError(null);
                  setShowSchedule(true);
                }}
              >
                Publish Later
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDeleteError(null);
              setShowDelete(true);
            }}
          >
            Delete
          </Button>
        </>
      }
    >
      {isOwnArticle ? (
        <output className="mb-6 block rounded-lg border border-border bg-accent-yellow/30 px-4 py-3 text-sm text-foreground">
          You authored this article. Another editor must publish it.
        </output>
      ) : null}

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
          {article.scheduledRevisionId && article.scheduledAt ? (
            <p className="mt-1">
              Scheduled {scheduledRevisionLabel ?? 'revision'} for{' '}
              {formatDateTime(article.scheduledAt)}.
            </p>
          ) : null}
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

      <ConfirmDialog
        open={showDelete}
        title="Delete Article?"
        description="This article will no longer be publicly available."
        details={<p className="font-medium">{article.title}</p>}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      <SchedulePublishDialog
        open={showSchedule && !isOwnArticle}
        revisionLabel={revisionLabel}
        date={scheduleDate}
        time={scheduleTime}
        loading={scheduleMutation.isPending}
        error={scheduleError}
        onDateChange={setScheduleDate}
        onTimeChange={setScheduleTime}
        onConfirm={() => {
          void handleSchedule();
        }}
        onCancel={() => {
          setShowSchedule(false);
          setScheduleError(null);
        }}
      />
    </DashboardShell>
  );
}
