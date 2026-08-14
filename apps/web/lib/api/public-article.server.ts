import { unwrapData } from './envelope';
import type { PublicArticleDetail } from './articles';

function gatewayOrigin(): string {
  return (process.env.API_GATEWAY_URL ?? 'http://localhost:3001').replace(/\/$/, '');
}

/**
 * Server-only fetch for generateMetadata / notFound().
 * Axios `apiClient` uses the relative `/api` base, which is not resolvable in RSC.
 */
export async function fetchPublicArticleBySlugServer(
  slug: string,
): Promise<PublicArticleDetail | null> {
  const response = await fetch(
    `${gatewayOrigin()}/articles/public/${encodeURIComponent(slug)}`,
    { next: { revalidate: 60 } },
  );

  if (response.status === 404 || response.status === 400) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Public article request failed (${response.status})`);
  }

  const payload: unknown = await response.json();
  return unwrapData<PublicArticleDetail>(payload);
}
