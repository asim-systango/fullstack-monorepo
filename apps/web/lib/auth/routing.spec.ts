import {
  NAV_BY_ROLE,
  ROLE_HOME,
  canAccess,
  isProtectedPath,
  pathAfterLogin,
  safeNextPath,
} from './routing';

describe('routing', () => {
  it('protects the three app areas only', () => {
    expect(isProtectedPath('/leave')).toBe(true);
    expect(isProtectedPath('/leave/new')).toBe(true);
    expect(isProtectedPath('/manager/requests')).toBe(true);
    expect(isProtectedPath('/admin/balances')).toBe(true);
    expect(isProtectedPath('/login')).toBe(false);
    expect(isProtectedPath('/leaves')).toBe(false);
  });

  it('lets each role into its own area', () => {
    expect(canAccess('user', '/leave/123')).toBe(true);
    expect(canAccess('user', '/manager/requests')).toBe(false);
    expect(canAccess('user', '/admin/leave-types')).toBe(false);
    expect(canAccess('staff', '/manager/requests')).toBe(true);
    expect(canAccess('staff', '/leave')).toBe(true);
    expect(canAccess('staff', '/admin/balances')).toBe(false);
    expect(canAccess('admin', '/admin/balances')).toBe(true);
    expect(canAccess('admin', '/leave')).toBe(false);
    expect(canAccess('admin', '/ui')).toBe(true);
  });

  it('only shows nav links the role can open', () => {
    for (const role of ['user', 'staff', 'admin'] as const) {
      for (const link of NAV_BY_ROLE[role]) {
        expect(canAccess(role, link.href)).toBe(true);
      }
      expect(canAccess(role, ROLE_HOME[role])).toBe(true);
    }
  });

  it('keeps safe same-site paths', () => {
    expect(safeNextPath('/leave')).toBe('/leave');
    expect(safeNextPath('/leave/new?x=1')).toBe('/leave/new?x=1');
  });

  it.each([
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    'javascript:alert(1)',
    'leave',
    '',
    null,
    undefined,
  ])('blocks open redirect %p', (next) => {
    expect(safeNextPath(next)).toBeNull();
  });

  it('sends people to next only if their role may open it', () => {
    expect(pathAfterLogin('user', '/leave/new')).toBe('/leave/new');
    expect(pathAfterLogin('user', '/manager/requests')).toBe('/leave');
    expect(pathAfterLogin('staff', '//evil.com')).toBe('/manager/requests');
    expect(pathAfterLogin('admin', null)).toBe('/admin/leave-types');
    expect(pathAfterLogin('user', '/login')).toBe('/leave');
  });
});
