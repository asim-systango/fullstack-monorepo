'use client';

import { use } from 'react';
import { EditorGuard } from '@/components/auth/route-guard';
import { EditArticleView } from '@/components/studio/edit-article-view';

const EDITOR_NAV = [
  { href: '/editor', label: 'Review Queue' },
  { href: '/editor/tags', label: 'Tags' },
];

type PageProps = { params: Promise<{ id: string }> };

export default function EditorEditArticlePage({ params }: Readonly<PageProps>) {
  const { id } = use(params);

  return (
    <EditorGuard>
      <EditArticleView
        id={id}
        role="staff"
        navItems={EDITOR_NAV}
        backHref={`/editor/articles/${id}`}
        backLabel="Back to review"
        previewHref={`/editor/articles/${id}`}
      />
    </EditorGuard>
  );
}
