'use client';

import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Button,
} from '@shared/ui/components';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
}

export function CancelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = 'Cancel Appointment Confirmation',
  description = 'Are you sure you want to cancel this scheduled appointment?',
  confirmText = 'Yes, Cancel Appointment',
}: Readonly<CancelConfirmationModalProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <DialogTitle className="text-base text-foreground font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please review the policy before proceeding.
          </DialogDescription>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-4 py-2 text-xs">
        <p className="text-foreground">{description}</p>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-xs">Payment & Refund Policy Notice:</p>
            <p className="text-[11px] leading-relaxed opacity-90">
              Please note that appointment consultation payments are{' '}
              <strong>non-refundable</strong> upon cancellation. Once cancelled, your
              reserved slot will be released back to the clinic schedule.
            </p>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          className="text-xs"
        >
          Keep Appointment
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onConfirm}
          loading={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white text-xs border-transparent"
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
