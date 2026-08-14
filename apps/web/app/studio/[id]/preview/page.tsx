'use client';

import Link from 'next/link';
import { use } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ArticleReader, toContentBlocks } from '@/components/article';
import { ApiClientError } from '@/lib/api';
import {
  getLatestRevision,
  getPublishedRevisionIndex,
  getRevisionLabel,
  getSubmittedRevisionIndex,
} from '@/lib/api/studio';
import { formatRelativeTime } from '@/lib/format/date';
import { useStudioArticle } from '@/hooks/use-studio';

const STUDIO_NAV = [
  { href: '/studio', label: 'My Articles' },
  { href: '/studio/new', label: 'Create Article' },
];

function DraftPreviewContent({ id }: Readonly<{ id: string }>) {
  const { data: article, isLoading, isError, error } = useStudioArticle(id);

  if (isLoading) {
    return (
      <DashboardShell title="Preview" role="user" navItems={STUDIO_NAV}>
        <p className="text-sm text-muted-foreground">Loading preview…</p>
      </DashboardShell>
    );
  }

  if (isError || !article) {
    const notFound = error instanceof ApiClientError && error.statusCode === 404;
    return (
      <DashboardShell title="Preview" role="user" navItems={STUDIO_NAV}>
        <p className="text-sm text-red-600" role="alert">
          {notFound
            ? 'This article does not exist, was deleted, or is not yours.'
            : 'Could not load this preview.'}
        </p>
        <Link href="/studio" className="mt-4 inline-block text-sm underline">
          Back to My Articles
        </Link>
      </DashboardShell>
    );
  }

  const latest = getLatestRevision(article);
  const publishedIndex = getPublishedRevisionIndex(article);
  const submittedIndex = getSubmittedRevisionIndex(article);
  const latestLabel = getRevisionLabel(article.revisions.length - 1);

  return (
    <DashboardShell
      title="Draft Preview"
      subtitle="Exactly how this revision will read once an Editor publishes it."
      role="user"
      navItems={STUDIO_NAV}
      actions={
        <>
          <Link
            href="/studio"
            className="inline-flex h-10 items-center px-4 text-sm text-muted-foreground no-underline hover:text-foreground hover:underline"
          >
            Back
          </Link>
          <Link
            href={`/studio/${id}`}
            className="inline-flex h-10 items-center rounded-pill bg-button-primary px-5 text-sm font-medium text-button-primary-foreground no-underline hover:bg-foreground"
          >
            Edit
          </Link>
        </>
      }
    >
      {/* Private to the studio — nothing here is served by /blog until published. */}
      <div className="mb-6 rounded-lg border border-border bg-surface-muted/40 p-4 text-sm text-muted-foreground">
        <p>
          Previewing {latestLabel}.{' '}
          {publishedIndex >= 0
            ? `The public blog is currently showing ${getRevisionLabel(publishedIndex)}.`
            : 'This article is not on the public blog yet.'}
        </p>
        {submittedIndex >= 0 ? (
          <p className="mt-1">
            An Editor is reviewing {getRevisionLabel(submittedIndex)}.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-border p-6 md:p-10">
        <ArticleReader
          title={article.title}
          blocks={toContentBlocks(latest?.content ?? [])}
          media={latest?.media ?? []}
          tags={article.tags}
          meta={<span>Draft · Updated {formatRelativeTime(article.updatedAt)}</span>}
        />
      </div>
    </DashboardShell>
  );
}

type PageProps = { params: Promise<{ id: string }> };

export default function DraftPreviewPage({ params }: Readonly<PageProps>) {
  const { id } = use(params);

  return (
    <StudioGuard>
      <DraftPreviewContent id={id} />
    </StudioGuard>
  );
}
