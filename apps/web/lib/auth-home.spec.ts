import { roleHome, safeNextPath } from './auth-home';

describe('roleHome', () => {
  it('routes candidates to resumes', () => {
    expect(roleHome('user')).toBe('/resumes');
  });

  it('routes admins to templates', () => {
    expect(roleHome('admin')).toBe('/admin/templates');
  });

  it('routes staff to home', () => {
    expect(roleHome('staff')).toBe('/');
  });
});

describe('safeNextPath', () => {
  it('allows same-origin relative paths', () => {
    expect(safeNextPath('/resumes')).toBe('/resumes');
    expect(safeNextPath('/admin/templates?x=1')).toBe('/admin/templates?x=1');
  });

  it('rejects open redirects', () => {
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath('')).toBeNull();
    expect(safeNextPath('https://evil.example')).toBeNull();
    expect(safeNextPath('//evil.example')).toBeNull();
  });
});
