import { resolveApiBaseUrl } from './api-base-url';

describe('resolveApiBaseUrl', () => {
  it('defaults to http://localhost:3002/api/v1', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('http://localhost:3002/api/v1');
  });

  it('strips a trailing slash', () => {
    expect(resolveApiBaseUrl('http://localhost:3001/')).toBe('http://localhost:3001');
  });

  it('keeps paths without a trailing slash', () => {
    expect(resolveApiBaseUrl('/api')).toBe('/api');
  });
});
