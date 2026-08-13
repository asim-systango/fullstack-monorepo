'use client';

import Link from 'next/link';
import { Suspense, use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditorGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { getLatestRevision, getRevisionLabel } from '@/lib/api/studio';
import { usePublishArticle, useStudioArticle } from '@/hooks/use-studio';

const EDITOR_NAV = [
  { href: '/editor', label: 'Overview' },
  { href: '/editor', label: 'Articles to Publish' },
];

function EditorReviewContent({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisionFromQuery = searchParams.get('revision');
  const { data: article, isLoading, isError } = useStudioArticle(id);
  const publishMutation = usePublishArticle();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError || !article)
    return <p className="text-sm text-red-600">Article not found.</p>;

  const latest = getLatestRevision(article);
  const revisionId = revisionFromQuery ?? latest?.id;
  const revisionIndex = article.revisions.findIndex((r) => r.id === revisionId);
  const revision = article.revisions[revisionIndex] ?? latest;
  const labelIndex =
    revisionIndex >= 0 ? revisionIndex : Math.max(article.revisions.length - 1, 0);
  const bodyBlock = revision?.content.find(
    (block): block is { type: string; markdown?: string } =>
      typeof block === 'object' &&
      block !== null &&
      'type' in block &&
      (block as { type: string }).type === 'paragraph',
  );
  const markdown =
    bodyBlock && 'markdown' in bodyBlock && typeof bodyBlock.markdown === 'string'
      ? bodyBlock.markdown
      : 'No content.';

  async function handlePublish() {
    if (!revisionId) return;
    setError(null);
    try {
      await publishMutation.mutateAsync({ articleId: id, revisionId });
      setShowConfirm(false);
      router.push('/editor');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Publish failed.');
    }
  }

  return (
    <DashboardShell
      title={article.title}
      subtitle="Review before publishing to the public blog."
      role="staff"
      navItems={EDITOR_NAV}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/editor" className="text-sm underline underline-offset-2">
          ← Back
        </Link>
        {article.slug ? (
          <span className="text-sm text-muted-foreground">Slug: /{article.slug}</span>
        ) : null}
      </div>

      <section className="rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">
          Revision: {revision ? getRevisionLabel(labelIndex) : '—'}
        </p>
        <div className="prose mt-6 max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed text-body">
          {markdown}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" variant="primary" onClick={() => setShowConfirm(true)}>
          Publish
        </Button>
      </div>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Publish Article?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You are about to make this revision publicly visible on the blog.
            </p>
            <p className="mt-4 text-sm font-medium">{article.title}</p>
            {error ? (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={publishMutation.isPending}
                onClick={handlePublish}
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}

type PageProps = { params: Promise<{ id: string }> };

function EditorReviewPageInner({ id }: Readonly<{ id: string }>) {
  return <EditorReviewContent id={id} />;
}

export default function EditorReviewPage({ params }: Readonly<PageProps>) {
  const { id } = use(params);
  return (
    <EditorGuard>
      <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading…</p>}>
        <EditorReviewPageInner id={id} />
      </Suspense>
    </EditorGuard>
  );
}
