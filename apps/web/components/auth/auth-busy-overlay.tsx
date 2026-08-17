'use client';

import { useAuth } from './auth-provider';

const LABELS = {
  login: 'Signing in…',
  logout: 'Logging out…',
  register: 'Creating account…',
} as const;

export function AuthBusyOverlay() {
  const { pendingAction } = useAuth();

  if (!pendingAction) return null;

  return (
    <output className="tg-api-loading" aria-live="polite" aria-busy="true">
      <div className="tg-api-loading-card">
        <span className="tg-api-loading-spinner" aria-hidden />
        <span>{LABELS[pendingAction]}</span>
      </div>
    </output>
  );
}
