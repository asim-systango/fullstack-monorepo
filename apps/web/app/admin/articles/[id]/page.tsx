'use client';

import { Suspense, use } from 'react';
import { ADMIN_NAV } from '@/components/admin';
import { AdminGuard } from '@/components/auth/route-guard';
import { ArticleReviewView } from '@/components/studio/article-review-view';

type PageProps = { params: Promise<{ id: string }> };

/**
 * Admins publish through the same review flow and the same endpoint as editors —
 * `POST /articles/:id/publish` already allows both roles.
 */
export default function AdminReviewPage({ params }: Readonly<PageProps>) {
  const { id } = use(params);

  return (
    <AdminGuard>
      <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading…</p>}>
        <ArticleReviewView
          id={id}
          role="admin"
          navItems={ADMIN_NAV}
          backHref="/admin/articles"
          backLabel="Back to articles"
        />
      </Suspense>
    </AdminGuard>
  );
}
