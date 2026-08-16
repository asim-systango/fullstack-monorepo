'use client';

import Link from 'next/link';
import { ADMIN_NAV, StatCard } from '@/components/admin';
import { AdminGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useCommentStats } from '@/hooks/use-comments';
import { useAdminUsers } from '@/hooks/use-admin';
import { useArticleStats } from '@/hooks/use-studio';

const SHORTCUTS = [
  {
    href: '/admin/articles',
    label: 'Articles',
    description: 'Review, publish, and remove any article on the platform.',
  },
  {
    href: '/admin/comments',
    label: 'Comments',
    description: 'Read every comment in one queue and delete abusive ones.',
  },
  {
    href: '/admin/tags',
    label: 'Tags',
    description: 'Rename and remove tags readers filter the blog by.',
  },
  {
    href: '/admin/editors',
    label: 'Editors',
    description: 'Add editors and see who can publish.',
  },
];

function AdminDashboardContent() {
  // Counts come from dedicated aggregate endpoints. Summing a page of results
  // would silently under-report as soon as the platform outgrows one page.
  const articleStats = useArticleStats();
  const commentStats = useCommentStats();
  const users = useAdminUsers();

  const statsFailed = articleStats.isError || commentStats.isError || users.isError;

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Platform-wide counts, content moderation, and editor management."
      role="admin"
      navItems={ADMIN_NAV}
    >
      {statsFailed ? (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Some statistics could not be loaded. Check that the API is running, then reload.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Articles" value={articleStats.data?.total} />
        <StatCard label="Published Articles" value={articleStats.data?.published} />
        <StatCard label="Draft Articles" value={articleStats.data?.drafts} />
        <StatCard
          label="Articles Pending Review"
          value={articleStats.data?.pendingReview}
          hint="Includes live articles with a newer revision awaiting review."
        />
        <StatCard label="Total Authors" value={users.data?.counts.authors} />
        <StatCard label="Total Editors" value={users.data?.counts.editors} />
        <StatCard label="Total Comments" value={commentStats.data?.total} />
        <StatCard
          label="Deleted Articles"
          value={articleStats.data?.deleted}
          hint="Soft-deleted — kept in the database, gone from the blog."
        />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-foreground">Manage</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="rounded-lg border border-border p-5 no-underline transition-colors hover:bg-surface-muted"
            >
              <p className="font-medium text-foreground">{shortcut.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{shortcut.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
