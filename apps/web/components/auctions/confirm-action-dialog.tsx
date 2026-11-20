'use client';

import { useState, type ReactNode } from 'react';
import { ApiClientError } from '@shared/api-client';
import {
  Button,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  StatusMessage,
} from '@shared/ui/components';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

export function ConfirmActionDialog({
  triggerLabel,
  triggerVariant = 'danger',
  triggerSize = 'sm',
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  loadingText = 'Working…',
  disabled = false,
  onConfirm,
}: Readonly<{
  triggerLabel: ReactNode;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  title: string;
  description: string;
  confirmLabel: ReactNode;
  confirmVariant?: ButtonVariant;
  loadingText?: string;
  disabled?: boolean;
  onConfirm: () => Promise<unknown>;
}>) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Action failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        disabled={disabled}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            loading={pending}
            loadingText={loadingText}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
