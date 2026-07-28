import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { applyAuthCookieToProxyRequest, isGatewayOwnedPath } from './proxy-hop';

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
      { cookies: { [AUTH_COOKIE_NAME]: 'jwt-token-value' } },
    );

    expect(setHeader).toHaveBeenCalledWith('Authorization', 'Bearer jwt-token-value');
    expect(removeHeader).toHaveBeenCalledWith('cookie');
  });

  it('strips Cookie even when no auth cookie is present', () => {
    const setHeader = jest.fn();
    const removeHeader = jest.fn();

    applyAuthCookieToProxyRequest(
      { setHeader, removeHeader },
      { cookies: { other: '1' } },
    );

    expect(setHeader).not.toHaveBeenCalled();
    expect(removeHeader).toHaveBeenCalledWith('cookie');
  });

  it('handles missing cookies object', () => {
    const setHeader = jest.fn();
    const removeHeader = jest.fn();

    applyAuthCookieToProxyRequest({ setHeader, removeHeader }, { cookies: undefined });

    expect(setHeader).not.toHaveBeenCalled();
    expect(removeHeader).toHaveBeenCalledWith('cookie');
  });
});
