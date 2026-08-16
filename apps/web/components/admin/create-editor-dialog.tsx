'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input } from '@/components/ui';

type CreateEditorDialogProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (input: { name: string; email: string; password: string }) => void;
  onCancel: () => void;
};

/**
 * Native `<dialog>` so focus trapping and Escape come from the platform, wrapping
 * a real form so the browser enforces required fields and the minimum password
 * length before anything reaches the gateway.
 */
export function CreateEditorDialog({
  open,
  loading,
  error,
  onSubmit,
  onCancel,
}: Readonly<CreateEditorDialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="create-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-md rounded-lg border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/40"
    >
      <h2 id="create-editor-title" className="font-display text-lg font-bold">
        Create Editor
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The editor signs in with this email and can publish immediately. Public signup
        always creates an author.
      </p>

      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ name: name.trim(), email: email.trim(), password });
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
        <Input
          name="editor-password"
          label="Password"
          type="password"
          required
          minLength={8}
          hint="At least 8 characters."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
          <Button type="submit" variant="primary" loading={loading}>
            Create Editor
          </Button>
        </div>
      </form>
    </dialog>
  );
}
