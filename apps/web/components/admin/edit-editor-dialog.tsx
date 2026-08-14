'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input } from '@/components/ui';
import type { AdminUser } from '@/lib/api/admin';

type EditEditorDialogProps = {
  editor: AdminUser;
  loading: boolean;
  error: string | null;
  onSubmit: (patch: { name?: string; email?: string }) => void;
  onCancel: () => void;
};

/**
 * Mount this only while editing, keyed by editor id, so the fields always start
 * from the row that was clicked rather than holding a previous editor's values.
 */
export function EditEditorDialog({
  editor,
  loading,
  error,
  onSubmit,
  onCancel,
}: Readonly<EditEditorDialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(editor.name);
  const [email, setEmail] = useState(editor.email);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const changed = trimmedName !== editor.name || trimmedEmail !== editor.email;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-md rounded-lg border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/40"
    >
      <h2 id="edit-editor-title" className="font-display text-lg font-bold">
        Edit Editor
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Changing the email changes the address this editor signs in with.
      </p>

      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          // Send only what moved so an untouched email cannot trip the uniqueness check.
          onSubmit({
            name: trimmedName === editor.name ? undefined : trimmedName,
            email: trimmedEmail === editor.email ? undefined : trimmedEmail,
          });
        }}
      >
        <Input
          name="editor-name"
          label="Name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          name="editor-email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!changed}>
            Save Changes
          </Button>
        </div>
      </form>
    </dialog>
  );
}
