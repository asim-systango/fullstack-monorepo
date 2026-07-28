import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import type { Request } from 'express';

/** Paths handled by the gateway itself (not proxied to apps/api). */
export function isGatewayOwnedPath(path: string): boolean {
  return (
    path === '/health' ||
    path.startsWith('/health/') ||
    path.startsWith('/auth') ||
    path.startsWith('/docs') ||
    path.startsWith('/swagger')
  );
}

type ProxyOutgoing = {
  setHeader(name: string, value: string): void;
  removeHeader(name: string): void;
};

/**
 * Cookie JWT → `Authorization: Bearer` for upstream, then strip Cookie
 * so the domain API never sees browser cookies.
 */
export function applyAuthCookieToProxyRequest(
  proxyReq: ProxyOutgoing,
  req: Pick<Request, 'cookies'>,
  cookieName: string = AUTH_COOKIE_NAME,
): void {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.[cookieName];
  if (token) {
    proxyReq.setHeader('Authorization', `Bearer ${token}`);
  }
  proxyReq.removeHeader('cookie');
}
