import { resolveApiBaseUrl } from './api-base-url';

describe('resolveApiBaseUrl', () => {
  it('defaults to /api/v1', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('/api/v1');
  });

  it('strips a trailing slash', () => {
    expect(resolveApiBaseUrl('http://localhost:3001/')).toBe('http://localhost:3001');
  });

  it('keeps paths without a trailing slash', () => {
    expect(resolveApiBaseUrl('/api')).toBe('/api');
  });
});
