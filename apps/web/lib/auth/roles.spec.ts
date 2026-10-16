import {
  canCheckout,
  canManageBooks,
  canManageFines,
  canManageMembers,
  canManageSettings,
  canReturn,
  ROLES,
} from './roles';

const user = { role: ROLES.user } as const;
const staff = { role: ROLES.staff } as const;
const admin = { role: ROLES.admin } as const;

describe('can* helpers', () => {
  it('limits desk issue/return to staff', () => {
    expect(canCheckout(staff)).toBe(true);
    expect(canReturn(staff)).toBe(true);
    expect(canCheckout(admin)).toBe(false);
    expect(canReturn(user)).toBe(false);
  });

  it('lets librarians manage catalog, members, and fines', () => {
    expect(canManageBooks(staff)).toBe(true);
    expect(canManageBooks(admin)).toBe(true);
    expect(canManageMembers(staff)).toBe(true);
    expect(canManageFines(admin)).toBe(true);
    expect(canManageBooks(user)).toBe(false);
  });

  it('keeps settings admin-only', () => {
    expect(canManageSettings(admin)).toBe(true);
    expect(canManageSettings(staff)).toBe(false);
  });
});
