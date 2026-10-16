import { safeAppPath } from './oauth-path.util';

describe('safeAppPath', () => {
  it('defaults to /groups', () => {
    expect(safeAppPath(undefined)).toBe('/groups');
    expect(safeAppPath('')).toBe('/groups');
  });

  it('allows in-app paths including query strings', () => {
    expect(safeAppPath('/invites/accept?token=abc')).toBe('/invites/accept?token=abc');
  });

  it('decodes a single URI encoding', () => {
    expect(safeAppPath(encodeURIComponent('/groups/1'))).toBe('/groups/1');
  });

  it('rejects open redirects', () => {
    expect(safeAppPath('https://evil.example')).toBe('/groups');
    expect(safeAppPath('//evil.example')).toBe('/groups');
    expect(safeAppPath('/\\evil.example')).toBe('/groups');
  });
});
