/**
 * Build Axios `params` from a filter object.
 * Drops undefined, null, and empty strings. Booleans/numbers pass through.
 */
export function buildQueryParams(
  input: Record<string, string | number | boolean | undefined | null> | undefined,
): Record<string, string | number | boolean> | undefined {
  if (!input) return undefined;
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = value;
  }
  return Object.keys(params).length > 0 ? params : undefined;
}
