'use client';

import type { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components';

type ConfirmDialogProps = Readonly<{
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}>;

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  pending = false,
  error,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onClose();
      }}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </DialogHeader>
      {children || error ? (
        <DialogBody>
          {children}
          {error ? <p className="mt-2 mb-0 text-sm text-destructive">{error}</p> : null}
        </DialogBody>
      ) : null}
      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Keep it
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          loading={pending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
