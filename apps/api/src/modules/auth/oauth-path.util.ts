/** Relative in-app path only — rejects protocol-relative and absolute URLs. */
export function safeAppPath(value: string | null | undefined): string {
  if (!value) return '/groups';

  let path: string;
  try {
    path = decodeURIComponent(value);
  } catch {
    return '/groups';
  }

  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    path.includes('://')
  ) {
    return '/groups';
  }

  return path;
}
