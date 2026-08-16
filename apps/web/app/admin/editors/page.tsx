'use client';

import { useState } from 'react';
import {
  ADMIN_NAV,
  AsyncListState,
  CreateEditorDialog,
  EditEditorDialog,
} from '@/components/admin';
import { AdminGuard } from '@/components/auth/route-guard';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button, ConfirmDialog, cn } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import type { AdminUser } from '@/lib/api/admin';
import { getRoleLabel } from '@/lib/auth/roles';
import { formatDate } from '@/lib/format/date';
import { useAdminUsers, useCreateEditor, useUpdateAdminUser } from '@/hooks/use-admin';

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiClientError ? err.message : fallback;
}

function AdminEditorsContent() {
  const { data, isLoading, isError } = useAdminUsers();
  const createEditor = useCreateEditor();
  const updateUser = useUpdateAdminUser();

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<AdminUser | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const editors = data?.users.filter((user) => user.role === 'staff') ?? [];

  function openDialog() {
    setCreateError(null);
    setSuccess(null);
    setShowDialog(true);
  }

  async function handleCreateEditor(input: {
    name: string;
    email: string;
    password: string;
  }) {
    setCreateError(null);
    try {
      const created = await createEditor.mutateAsync(input);
      setSuccess(`${created.name} can now publish articles.`);
      setShowDialog(false);
    } catch (err) {
      setCreateError(errorMessage(err, 'Could not create editor.'));
    }
  }

  async function handleEdit(patch: { name?: string; email?: string }) {
    if (!editing) return;

    setEditError(null);
    try {
      const updated = await updateUser.mutateAsync({ id: editing.id, ...patch });
      setSuccess(`${updated.name}'s details were updated.`);
      setEditing(null);
    } catch (err) {
      setEditError(errorMessage(err, 'Could not update editor.'));
    }
  }

  async function handleDeactivate() {
    if (!pendingDeactivate) return;

    setDeactivateError(null);
    try {
      await updateUser.mutateAsync({ id: pendingDeactivate.id, isActive: false });
      setSuccess(`${pendingDeactivate.name} can no longer sign in.`);
      setPendingDeactivate(null);
    } catch (err) {
      setDeactivateError(errorMessage(err, 'Could not deactivate editor.'));
    }
  }

  async function handleActivate(editor: AdminUser) {
    setRowError(null);
    setSuccess(null);
    try {
      await updateUser.mutateAsync({ id: editor.id, isActive: true });
      setSuccess(`${editor.name} can sign in again.`);
    } catch (err) {
      setRowError(errorMessage(err, 'Could not reactivate editor.'));
    }
  }

  function startEdit(editor: AdminUser) {
    setEditError(null);
    setSuccess(null);
    setEditing(editor);
  }

  function startDeactivate(editor: AdminUser) {
    setDeactivateError(null);
    setSuccess(null);
    setPendingDeactivate(editor);
  }

  return (
    <DashboardShell
      title="Editors"
      subtitle="Editors are the only role that can publish an article to the blog."
      role="admin"
      navItems={ADMIN_NAV}
      actions={
        <Button type="button" variant="primary" onClick={openDialog}>
          + Add Editor
        </Button>
      }
    >
      {success ? (
        <output className="mb-6 block rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand">
          {success}
        </output>
      ) : null}

      {rowError ? (
        <p
          className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {rowError}
        </p>
      ) : null}

      <AsyncListState
        isLoading={isLoading}
        isError={isError}
        isEmpty={editors.length === 0}
        errorLabel="Could not load editors. Check that the gateway is running, then try again."
        emptyLabel="No editors yet. Add one to enable publishing."
        emptyAction={
          <Button type="button" variant="outline" onClick={openDialog}>
            Add the first editor
          </Button>
        }
        skeletonRows={3}
      />

      {editors.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editors.map((editor) => (
                <tr key={editor.id} className="border-b border-border last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    {editor.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{editor.email}</td>
                  <td className="px-4 py-3">{getRoleLabel(editor.role)}</td>
                  <td className="px-4 py-3">
                    {/* Same box in both states so one deactivated row cannot alter row height. */}
                    <span
                      className={cn(
                        'inline-flex items-center rounded-pill px-2 py-1 text-xs font-medium whitespace-nowrap',
                        editor.isActive
                          ? 'text-muted-foreground'
                          : 'bg-surface-muted text-foreground',
                      )}
                    >
                      {editor.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(editor.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(editor)}
                      >
                        Edit
                      </Button>
                      {/* Fixed width: the two labels differ in length, and without it
                          Edit shifts sideways on whichever rows are deactivated. */}
                      {editor.isActive ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-28"
                          onClick={() => startDeactivate(editor)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-28"
                          onClick={() => handleActivate(editor)}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <CreateEditorDialog
        open={showDialog}
        loading={createEditor.isPending}
        error={createError}
        onSubmit={handleCreateEditor}
        onCancel={() => setShowDialog(false)}
      />

      {editing ? (
        <EditEditorDialog
          key={editing.id}
          editor={editing}
          loading={updateUser.isPending}
          error={editError}
          onSubmit={handleEdit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={pendingDeactivate !== null}
        title="Deactivate Editor?"
        description="They are signed out immediately and cannot sign in again until reactivated. Their articles, revisions, and comments stay exactly as they are."
        details={
          pendingDeactivate ? (
            <>
              <p className="font-medium text-foreground">{pendingDeactivate.name}</p>
              <p className="mt-1 text-muted-foreground">{pendingDeactivate.email}</p>
            </>
          ) : null
        }
        confirmLabel="Deactivate"
        loading={updateUser.isPending}
        error={deactivateError}
        onConfirm={handleDeactivate}
        onCancel={() => setPendingDeactivate(null)}
      />
    </DashboardShell>
  );
}

export default function AdminEditorsPage() {
  return (
    <AdminGuard>
      <AdminEditorsContent />
    </AdminGuard>
  );
}
