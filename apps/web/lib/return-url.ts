function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/groups';
  return value;
}

/** Google/social login: keep invite links, otherwise land on the groups list. */
function oauthReturnPath(value: string | null | undefined): string {
  const path = safeReturnPath(value);
  if (path.startsWith('/invites/accept')) return path;
  return '/groups';
}

const RETURN_URL_STORAGE_KEY = 'splitter.returnUrl';

function rememberReturnPath(path: string) {
  if (typeof window === 'undefined') return;
  const safe = safeReturnPath(path);
  if (safe === '/groups') {
    sessionStorage.removeItem(RETURN_URL_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(RETURN_URL_STORAGE_KEY, safe);
}

function peekRememberedReturnPath(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(RETURN_URL_STORAGE_KEY);
  if (!stored) return null;
  const safe = safeReturnPath(stored);
  return safe === '/groups' ? null : safe;
}

function takeRememberedReturnPath(): string | null {
  const stored = peekRememberedReturnPath();
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(RETURN_URL_STORAGE_KEY);
  }
  return stored;
}

export {
  safeReturnPath,
  oauthReturnPath,
  rememberReturnPath,
  peekRememberedReturnPath,
  takeRememberedReturnPath,
};
