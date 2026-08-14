'use client';

import { use } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { EditArticleView } from '@/components/studio/edit-article-view';

const STUDIO_NAV = [
  { href: '/studio', label: 'My Articles' },
  { href: '/studio/new', label: 'Create Article' },
];

type PageProps = { params: Promise<{ id: string }> };

export default function EditArticlePage({ params }: Readonly<PageProps>) {
  const { id } = use(params);

  return (
    <StudioGuard>
      <EditArticleView
        id={id}
        role="user"
        navItems={STUDIO_NAV}
        backHref="/studio"
        backLabel="Back to My Articles"
        previewHref={`/studio/${id}/preview`}
      />
    </StudioGuard>
  );
}
