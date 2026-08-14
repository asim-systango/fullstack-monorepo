'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Button, type ButtonVariant } from './button';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** Extra context rendered above the buttons, e.g. article title and revision. */
  details?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Modal confirmation for destructive or publicly visible actions.
 * Built on native `<dialog>` so focus trapping and Escape come from the platform.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  details,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
  error,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-md rounded-lg border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/40"
    >
      <h2 id="confirm-dialog-title" className="font-display text-lg font-bold">
        {title}
      </h2>

      {description ? (
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
      ) : null}

      {details ? (
        <div className="mt-4 rounded-lg bg-surface-muted p-4 text-sm">{details}</div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
