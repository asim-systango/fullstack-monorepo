'use client';

import { use } from 'react';
import { StudioGuard } from '@/components/auth/route-guard';
import { EditArticleView } from '@/components/studio/edit-article-view';
import { getStudioWorkspace } from '@/components/studio/studio-nav';
import { useMe } from '@/hooks/use-auth';

type PageProps = { params: Promise<{ id: string }> };

function EditArticleContent({ id }: Readonly<{ id: string }>) {
  const { data: user } = useMe();
  const workspace = getStudioWorkspace(user?.role);

  return (
    <EditArticleView
      id={id}
      role={workspace.role}
      navItems={workspace.navItems}
      backHref="/studio"
      backLabel={workspace.backLabel}
      previewHref={`/studio/${id}/preview`}
    />
  );
}

export default function EditArticlePage({ params }: Readonly<PageProps>) {
  const { id } = use(params);

  return (
    <StudioGuard>
      <EditArticleContent id={id} />
    </StudioGuard>
  );
}
