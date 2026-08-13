'use client';

import { useMemo, useState } from 'react';
import { AdminGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { isPublished } from '@/lib/api/studio';
import { getRoleLabel } from '@/lib/auth/roles';
import { useAdminUsers, useCreateEditor } from '@/hooks/use-admin';
import { useStudioArticles } from '@/hooks/use-studio';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin', label: 'Editors' },
];

function AdminDashboardContent() {
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: articlesData } = useStudioArticles();
  const createEditor = useCreateEditor();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const articles = articlesData?.data ?? [];
  const stats = useMemo(
    () => ({
      totalArticles: articles.length,
      publishedArticles: articles.filter((a) => isPublished(a)).length,
      draftArticles: articles.filter((a) => !isPublished(a)).length,
    }),
    [articles],
  );

  const editors = usersData?.users.filter((u) => u.role === 'staff') ?? [];

  async function handleCreateEditor(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createEditor.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccess('Editor created successfully.');
      setName('');
      setEmail('');
      setPassword('');
      setShowModal(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not create editor.');
    }
  }

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Platform overview and editor management."
      role="admin"
      navItems={ADMIN_NAV}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Articles" value={stats.totalArticles} />
        <StatCard label="Published Articles" value={stats.publishedArticles} />
        <StatCard label="Draft Articles" value={stats.draftArticles} />
        <StatCard label="Total Authors" value={usersData?.counts.authors ?? 0} />
        <StatCard label="Total Editors" value={usersData?.counts.editors ?? 0} />
      </div>

      {success ? (
        <p className="mb-4 rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand">
          {success}
        </p>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Editors</h2>
          <Button type="button" variant="primary" onClick={() => setShowModal(true)}>
            + Add Editor
          </Button>
        </div>

        {usersLoading ? (
          <p className="text-sm text-muted-foreground">Loading editors…</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {editors.map((editor) => (
                  <tr key={editor.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">{editor.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{editor.email}</td>
                    <td className="px-4 py-3">{getRoleLabel(editor.role)}</td>
                    <td className="px-4 py-3 text-brand">Active</td>
                  </tr>
                ))}
                {editors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                      No editors yet. Add one to enable publishing.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Create Editor</h2>
            <form onSubmit={handleCreateEditor} className="mt-4 space-y-4">
              <Input
                label="Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={createEditor.isPending}>
                  Create Editor
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}

function StatCard({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-lg border border-border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
