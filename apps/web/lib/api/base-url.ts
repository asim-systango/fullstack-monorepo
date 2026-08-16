/** Same-origin `/api` → Next rewrite → api-gateway. Override only if needed. */
export function resolveApiBaseUrl(
  envValue: string | undefined = process.env.NEXT_PUBLIC_API_URL,
): string {
  return (envValue ?? '/api').replace(/\/$/, '');
}
