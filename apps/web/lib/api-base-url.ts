/** Direct API backend target URL. */
export function resolveApiBaseUrl(
  envValue: string | undefined = process.env.NEXT_PUBLIC_API_URL,
): string {
  return (envValue ?? '/api/v1').replace(/\/$/, '');
}
