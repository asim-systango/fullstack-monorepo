'use client';

import { useEffect } from 'react';
import { IconCheck, IconClose } from '@/components/splitter/icons';

export function ToastBanner({
  message,
  onDismiss,
}: Readonly<{ message: string; onDismiss: () => void }>) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  return (
    <output className="splitter-toast-banner" aria-live="polite">
      <span className="splitter-toast-icon" aria-hidden>
        <IconCheck />
      </span>
      <span className="splitter-toast-message">{message}</span>
      <button
        type="button"
        className="splitter-toast-close"
        aria-label="Close"
        onClick={onDismiss}
      >
        <IconClose />
      </button>
    </output>
  );
}
