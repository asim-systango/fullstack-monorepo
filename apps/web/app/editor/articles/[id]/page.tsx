'use client';

import { Suspense, use } from 'react';
import { EditorGuard } from '@/components/auth/route-guard';
import { ArticleReviewView } from '@/components/studio/article-review-view';

const EDITOR_NAV = [
  { href: '/editor', label: 'Review Queue' },
  { href: '/studio', label: 'Articles' },
  { href: '/editor/tags', label: 'Tags' },
];

type PageProps = { params: Promise<{ id: string }> };

export default function EditorReviewPage({ params }: Readonly<PageProps>) {
  const { id } = use(params);

  return (
    <EditorGuard>
      <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading…</p>}>
        <ArticleReviewView
          id={id}
          role="staff"
          navItems={EDITOR_NAV}
          backHref="/editor"
          editHref={`/editor/articles/${id}/edit`}
        />
      </Suspense>
    </EditorGuard>
  );
}
