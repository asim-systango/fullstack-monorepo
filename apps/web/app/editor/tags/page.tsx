'use client';

import { useState } from 'react';
import { EditorGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, ConfirmDialog, Input } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import type { Tag } from '@/lib/api/tags';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/hooks/use-tags';

const EDITOR_NAV = [
  { href: '/editor', label: 'Review Queue' },
  { href: '/editor/tags', label: 'Tags' },
];

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

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      {editing ? (
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label={`Rename ${tag.name}`}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-border-strong focus:outline-none"
        />
      ) : (
        <span className="text-sm font-medium text-foreground">{tag.name}</span>
      )}

      <div className="flex items-center gap-2">
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setName(tag.name);
                setError(null);
              }}
            >
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
              Rename
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(tag)}>
              Delete
            </Button>
          </>
        )}
      </div>

      {error ? (
        <p className="w-full text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function EditorTagsContent() {
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
      subtitle="Tags authors can apply to their articles and readers can filter by."
      role="staff"
      navItems={EDITOR_NAV}
    >
      <form onSubmit={handleCreate} className="mb-8 flex max-w-md items-end gap-3">
        <div className="flex-1">
          <Input
            label="New tag"
            value={newTag}
            required
            onChange={(event) => setNewTag(event.target.value)}
            error={createError ?? undefined}
          />
        </div>
        <Button type="submit" variant="primary" loading={createMutation.isPending}>
          Add
        </Button>
      </form>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading tags…</p> : null}

      {isError ? (
        <p className="text-sm text-red-600" role="alert">
          Could not load tags.
        </p>
      ) : null}

      {!isLoading && !isError && tags.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onDelete={setPendingDelete} />
          ))}
        </ul>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Tag?"
        description="The tag is removed from every article that uses it. Tags on published articles cannot be deleted."
        details={
          pendingDelete ? <p className="font-medium">{pendingDelete.name}</p> : null
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

export default function EditorTagsPage() {
  return (
    <EditorGuard>
      <EditorTagsContent />
    </EditorGuard>
  );
}
