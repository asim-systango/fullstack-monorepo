'use client';

import { IconGoogle } from '@/components/splitter/icons';
import { oauthReturnPath, rememberReturnPath } from '@/lib/return-url';

export function GoogleContinueButton({
  returnUrl,
  disabled = false,
}: Readonly<{ returnUrl?: string | null; disabled?: boolean }>) {
  const dest = oauthReturnPath(returnUrl ?? null);

  function startGoogleLogin() {
    rememberReturnPath(dest);
    const params = new URLSearchParams();
    if (dest !== '/groups') params.set('returnUrl', dest);
    const query = params.toString();
    window.location.assign(query ? `/api/auth/google?${query}` : '/api/auth/google');
  }

  return (
    <div className="splitter-auth-social">
      <button
        type="button"
        className="splitter-auth-social-btn"
        onClick={startGoogleLogin}
        disabled={disabled}
      >
        <span className="splitter-auth-social-icon">
          <IconGoogle />
        </span>
        <span className="splitter-auth-social-label">Continue with Google</span>
      </button>
    </div>
  );
}
