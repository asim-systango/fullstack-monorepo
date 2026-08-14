'use client';

import { useState } from 'react';
import { ADMIN_NAV, AsyncListState } from '@/components/admin';
import { AdminGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, ConfirmDialog, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import type { Tag } from '@/lib/api/tags';
import { formatDate } from '@/lib/format/date';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/hooks/use-tags';

function TagRow({ tag, onDelete }: Readonly<{ tag: Tag; onDelete: (tag: Tag) => void }>) {
  const updateMutation = useUpdateTag();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id: tag.id, name: name.trim() });
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not rename tag.');
    }
  }

  function cancelEdit() {
    setEditing(false);
    setName(tag.name);
    setError(null);
  }

  return (
    <>
      <tr className="border-b border-border last:border-b-0">
        <td className="px-4 py-3">
          {editing ? (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label={`Rename ${tag.name}`}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:outline-none"
            />
          ) : (
            <span className="font-medium text-foreground">{tag.name}</span>
          )}
        </td>
        <td className="px-4 py-3 text-muted-foreground">{tag.normalizedName}</td>
        <td className="px-4 py-3 text-muted-foreground">{tag.articleCount}</td>
        <td className="px-4 py-3 text-muted-foreground">{formatDate(tag.createdAt)}</td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            {editing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={updateMutation.isPending}
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(tag)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      {error ? (
        <tr>
          <td colSpan={5} className="px-4 pb-3 text-sm text-red-600">
            <span role="alert">{error}</span>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function AdminTagsContent() {
  const { data, isLoading, isError } = useTags();
  const createMutation = useCreateTag();
  const deleteMutation = useDeleteTag();

  const [newTag, setNewTag] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const tags = data?.data ?? [];

  async function handleCreate(event: { preventDefault(): void }) {
    event.preventDefault();
    setCreateError(null);

    try {
      await createMutation.mutateAsync(newTag.trim());
      setNewTag('');
    } catch (err) {
      setCreateError(
        err instanceof ApiClientError ? err.message : 'Could not create tag.',
      );
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiClientError ? err.message : 'Could not delete tag.',
      );
    }
  }

  return (
    <DashboardShell
      title="Tags"
      subtitle="Tags authors apply to articles and readers filter the blog by."
      role="admin"
      navItems={ADMIN_NAV}
    >
      <p className="mb-6 rounded-lg border border-border bg-surface-muted/40 p-4 text-sm text-muted-foreground">
        A tag used on a published article cannot be renamed or deleted — the API rejects
        it so live URLs and filters keep working. Unpublish or retag the article first.
      </p>

      <form onSubmit={handleCreate} className="mb-8 flex max-w-md items-end gap-3">
        <div className="flex-1">
          <Input
            name="new-tag"
            label="New tag"
            value={newTag}
            required
            hint="Stored lowercased — React and react are the same tag."
            onChange={(event) => setNewTag(event.target.value)}
            error={createError ?? undefined}
          />
        </div>
        <Button type="submit" variant="primary" loading={createMutation.isPending}>
          Add
        </Button>
      </form>

      <AsyncListState
        isLoading={isLoading}
        isError={isError}
        isEmpty={tags.length === 0}
        errorLabel="Could not load tags. Check that the API is running, then try again."
        emptyLabel="No tags yet. Add one so authors can categorise their articles."
        skeletonRows={3}
      />

      {tags.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Tag</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Articles</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <TagRow key={tag.id} tag={tag} onDelete={setPendingDelete} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Tag?"
        description="The tag is removed from every article that uses it. Articles and revisions are untouched."
        details={
          pendingDelete ? (
            <>
              <p className="font-medium text-foreground">{pendingDelete.name}</p>
              <p className="mt-1 text-muted-foreground">
                Used on {pendingDelete.articleCount}{' '}
                {pendingDelete.articleCount === 1 ? 'article' : 'articles'}
              </p>
            </>
          ) : null
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </DashboardShell>
  );
}

export default function AdminTagsPage() {
  return (
    <AdminGuard>
      <AdminTagsContent />
    </AdminGuard>
  );
}
