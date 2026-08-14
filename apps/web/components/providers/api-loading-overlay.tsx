'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth';
import { apiLoading } from '@/lib/api-loading';

export function ApiLoadingOverlay() {
  const { pendingAction } = useAuth();
  const [pending, setPending] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => apiLoading.subscribe(setPending), []);

  useEffect(() => {
    if (pending > 0) {
      setVisible(true);
      return;
    }

    const hideTimer = window.setTimeout(() => setVisible(false), 80);
    return () => window.clearTimeout(hideTimer);
  }, [pending]);

  if (pendingAction || !visible) return null;

  return (
    <div className="tg-api-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="tg-api-loading-card">
        <span className="tg-api-loading-spinner" aria-hidden />
        <span>Loading…</span>
      </div>
    </div>
  );
}
