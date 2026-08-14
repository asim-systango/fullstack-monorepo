import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { REQUEST_ID_HEADER } from '@shared/http/middleware';
import type { ServerResponse } from 'node:http';
import type { Socket } from 'node:net';
import type { Request, Response } from 'express';

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

type ProxyRequest = Pick<Request, 'cookies' | 'headers'> & { correlationId?: string };

export function applyAuthCookieToProxyRequest(
  proxyReq: ProxyOutgoing,
  req: ProxyRequest,
  cookieName: string = AUTH_COOKIE_NAME,
): void {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.[cookieName];
  if (token) {
    proxyReq.setHeader('Authorization', `Bearer ${token}`);
  }
  proxyReq.removeHeader('cookie');

  const requestId =
    req.correlationId ??
    (typeof req.headers[REQUEST_ID_HEADER] === 'string'
      ? req.headers[REQUEST_ID_HEADER]
      : undefined);
  if (requestId) {
    proxyReq.setHeader(REQUEST_ID_HEADER, requestId);
  }
}

export type ProxyErrorTarget = ServerResponse | Socket;

function isExpressResponse(res: ProxyErrorTarget): res is Response {
  return typeof (res as Response).status === 'function';
}

export function sendProxyError(res: ProxyErrorTarget): void {
  if (!isExpressResponse(res)) {
    res.destroy();
    return;
  }
  if (res.headersSent) return;
  res.status(502).json({
    statusCode: 502,
    error: 'Bad Gateway',
    message: 'Upstream service unavailable',
  });
}
