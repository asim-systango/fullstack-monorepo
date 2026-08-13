'use client';

import Link from 'next/link';
import { use } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getLatestRevision, getRevisionLabel, isPublished } from '@/lib/api/studio';
import { useStudioArticle } from '@/hooks/use-studio';

const STUDIO_NAV = [
  { href: '/studio', label: 'My Articles' },
  { href: '/studio/new', label: 'Create Article' },
];

function ArticleDetailContent({ id }: Readonly<{ id: string }>) {
  const { data: article, isLoading, isError } = useStudioArticle(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading article…</p>;
  }

  if (isError || !article) {
    return <p className="text-sm text-red-600">Article not found or access denied.</p>;
  }

  const latest = getLatestRevision(article);
  const bodyBlock = latest?.content.find(
    (block): block is { type: string; markdown?: string } =>
      typeof block === 'object' &&
      block !== null &&
      'type' in block &&
      (block as { type: string }).type === 'paragraph',
  );
  const markdown =
    bodyBlock && 'markdown' in bodyBlock && typeof bodyBlock.markdown === 'string'
      ? bodyBlock.markdown
      : 'No content in latest revision.';

  const published = isPublished(article);

  return (
    <DashboardShell
      title={article.title}
      subtitle={`/${article.slug} · ${published ? 'Published' : 'Draft'}`}
      role="user"
      navItems={STUDIO_NAV}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/studio"
          className="text-sm text-muted-foreground underline underline-offset-2"
        >
          ← Back to articles
        </Link>
        {published && article.slug ? (
          <Link
            href={`/blog/${article.slug}`}
            className="text-sm underline underline-offset-2"
          >
            Preview public page
          </Link>
        ) : null}
      </div>

      <section className="rounded-lg border border-border p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Latest revision</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {latest
            ? `${getRevisionLabel(article.revisions.length - 1)} · ${new Date(latest.createdAt).toLocaleString()}`
            : 'No revisions'}
        </p>
        <div className="prose mt-6 max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed text-body">
          {markdown}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Revision history</h2>
        <ul className="mt-3 space-y-2">
          {article.revisions.map((revision, index) => (
            <li
              key={revision.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
            >
              <span>
                {getRevisionLabel(index)}
                {article.publishedRevisionId === revision.id ? ' · Published' : ''}
              </span>
              <span className="text-muted-foreground">
                {new Date(revision.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Draft saved. An Editor will publish this article when it&apos;s ready.
      </p>
    </DashboardShell>
  );
}

type PageProps = { params: Promise<{ id: string }> };

export default function StudioArticlePage({ params }: Readonly<PageProps>) {
  const { id } = use(params);
  return (
    <StudioGuard>
      <ArticleDetailContent id={id} />
    </StudioGuard>
  );
}
