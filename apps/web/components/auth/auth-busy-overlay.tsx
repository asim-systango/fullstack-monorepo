'use client';

import { useAuth } from './auth-provider';

const LABELS = {
  login: 'Signing in…',
  logout: 'Logging out…',
  register: 'Creating account…',
} as const;

/** Full-screen overlay for login / logout / register (not generic API loading). */
export function AuthBusyOverlay() {
  const { pendingAction } = useAuth();

  if (!pendingAction) return null;

  return (
    <div className="tg-api-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="tg-api-loading-card">
        <span className="tg-api-loading-spinner" aria-hidden />
        <span>{LABELS[pendingAction]}</span>
      </div>
    </div>
  );
}
