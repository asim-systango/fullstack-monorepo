'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base font-bold">
          {variant === 'danger' ? (
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-blue-500 shrink-0" />
          )}
          <span>{title}</span>
        </DialogTitle>
      </DialogHeader>

      <DialogBody className="py-2">
        <DialogDescription className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {description}
        </DialogDescription>
      </DialogBody>

      <DialogFooter className="flex items-center justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={() => onOpenChange(false)}
          className="text-xs font-semibold"
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={variant}
          size="sm"
          loading={loading}
          onClick={() => {
            onConfirm();
          }}
          className="text-xs font-bold px-4"
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
