'use client';

import type { CSSProperties, ReactNode } from 'react';

type ModalShellProps = Readonly<{
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  closeOnBackdrop?: boolean;
  children: ReactNode;
  panelClassName?: string;
  panelStyle?: CSSProperties;
}>;

export function ModalShell({
  open,
  onClose,
  labelledBy,
  closeOnBackdrop = true,
  children,
  panelClassName = 'tg-card tg-modal-panel tg-fade-in',
  panelStyle,
}: ModalShellProps) {
  if (!open) return null;

  return (
    <div className="tg-modal-backdrop">
      {closeOnBackdrop ? (
        <button
          type="button"
          className="tg-modal-backdrop-dismiss"
          aria-label="Close dialog"
          tabIndex={-1}
          onClick={onClose}
        />
      ) : null}
      <dialog open className={panelClassName} aria-labelledby={labelledBy} aria-modal="true" style={panelStyle}>
        {children}
      </dialog>
    </div>
  );
}
