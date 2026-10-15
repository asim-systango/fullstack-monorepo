import { resolveApiBaseUrl } from './api-base-url';

describe('resolveApiBaseUrl', () => {
  it('defaults to /api', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('/api');
  });

  it('strips a trailing slash', () => {
    expect(resolveApiBaseUrl('http://localhost:3005/')).toBe('http://localhost:3005');
  });

  it('keeps paths without a trailing slash', () => {
    expect(resolveApiBaseUrl('/api')).toBe('/api');
  });
});
