import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { REQUEST_ID_HEADER } from '@shared/http/middleware';
import {
  applyAuthCookieToProxyRequest,
  isGatewayOwnedPath,
  sendProxyError,
} from './proxy-hop';

describe('isGatewayOwnedPath', () => {
  it.each(['/health', '/health/live', '/auth/login', '/docs', '/docs/json', '/swagger'])(
    'treats %s as gateway-owned',
    (path) => {
      expect(isGatewayOwnedPath(path)).toBe(true);
    },
  );

  it.each(['/ready', '/users', '/api/ready', '/'])('proxies %s to upstream', (path) => {
    expect(isGatewayOwnedPath(path)).toBe(false);
  });
});

describe('applyAuthCookieToProxyRequest (cookie → Bearer hop)', () => {
  it('forwards the auth cookie as Authorization Bearer and strips Cookie', () => {
    const setHeader = jest.fn();
    const removeHeader = jest.fn();

    applyAuthCookieToProxyRequest(
      { setHeader, removeHeader },
      { cookies: { [AUTH_COOKIE_NAME]: 'jwt-token-value' }, headers: {} },
    );

    expect(setHeader).toHaveBeenCalledWith('Authorization', 'Bearer jwt-token-value');
    expect(removeHeader).toHaveBeenCalledWith('cookie');
  });

  it('strips Cookie even when no auth cookie is present', () => {
    const setHeader = jest.fn();
    const removeHeader = jest.fn();

    applyAuthCookieToProxyRequest(
      { setHeader, removeHeader },
      { cookies: { other: '1' }, headers: {} },
    );

    expect(setHeader).not.toHaveBeenCalled();
    expect(removeHeader).toHaveBeenCalledWith('cookie');
  });

  it('forwards x-request-id when present on the incoming request', () => {
    const setHeader = jest.fn();
    const removeHeader = jest.fn();

    applyAuthCookieToProxyRequest(
      { setHeader, removeHeader },
      {
        cookies: {},
        headers: { [REQUEST_ID_HEADER]: 'trace-123' },
        correlationId: 'trace-123',
      },
    );

    expect(setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, 'trace-123');
  });
});

describe('sendProxyError', () => {
  it('returns a 502 envelope when headers are not sent', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { headersSent: false, status } as unknown as import('express').Response;

    sendProxyError(res);

    expect(status).toHaveBeenCalledWith(502);
    expect(json).toHaveBeenCalledWith({
      statusCode: 502,
      error: 'Bad Gateway',
      message: 'Upstream service unavailable',
    });
  });

  it('does nothing when headers were already sent', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { headersSent: true, status } as unknown as import('express').Response;

    sendProxyError(res);

    expect(status).not.toHaveBeenCalled();
  });

  it('destroys a raw socket instead of calling Response methods on it', () => {
    const destroy = jest.fn();
    const socket = { destroy } as unknown as import('node:net').Socket;

    expect(() => sendProxyError(socket)).not.toThrow();
    expect(destroy).toHaveBeenCalled();
  });
});
