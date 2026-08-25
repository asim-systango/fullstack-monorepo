/**
 * Single source of truth for "where does this role land after auth" —
 * used by the root-page redirect in `middleware.ts` (edge runtime, no icons/React)
 * and the post-login redirect, so the two never drift apart.
 *
 * Takes a bare `string` (not the `User['role']` union) since `middleware.ts`
 * reads the role from an unverified JWT claim — the domain API's `@Roles`
 * guards are the real authorization boundary, this is UI routing only.
 */
export function getHomeHref(role: string | null | undefined): string {
  if (role === 'user') return '/dashboard';
  if (role === 'staff') return '/coach';
  if (role === 'admin') return '/admin/coach-assignments';
  return '/';
}
