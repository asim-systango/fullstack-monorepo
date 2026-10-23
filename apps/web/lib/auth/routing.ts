export type Role = 'admin' | 'staff' | 'user';

export type NavLink = { href: string; label: string };

export const ROLE_LABEL: Record<Role, string> = {
  user: 'Employee',
  staff: 'Manager',
  admin: 'Admin',
};

export const ROLE_HOME: Record<Role, string> = {
  user: '/leave',
  staff: '/manager/requests',
  admin: '/admin/leave-types',
};

export const NAV_BY_ROLE: Record<Role, NavLink[]> = {
  user: [
    { href: '/leave', label: 'My leave' },
    { href: '/leave/new', label: 'Apply' },
  ],
  staff: [
    { href: '/manager/requests', label: 'Approvals' },
    { href: '/manager/away', label: "Who's away" },
    { href: '/leave', label: 'My leave' },
  ],
  admin: [
    { href: '/admin/leave-types', label: 'Leave types' },
    { href: '/admin/balances', label: 'Balances' },
    { href: '/admin/requests', label: 'Requests' },
    { href: '/admin/holidays', label: 'Holidays' },
  ],
};

// managers apply for leave too, so /leave is for both user and staff
const AREAS: ReadonlyArray<{ prefix: string; roles: readonly Role[] }> = [
  { prefix: '/leave', roles: ['user', 'staff'] },
  { prefix: '/manager', roles: ['staff'] },
  { prefix: '/admin', roles: ['admin'] },
];

function areaOf(pathname: string) {
  return AREAS.find((a) => pathname === a.prefix || pathname.startsWith(`${a.prefix}/`));
}

export function isProtectedPath(pathname: string): boolean {
  return areaOf(pathname) !== undefined;
}

export function canAccess(role: Role, pathname: string): boolean {
  const area = areaOf(pathname);
  return area ? area.roles.includes(role) : true;
}

// only paths on our own site, "//evil.com" and "/\evil.com" both resolve to another origin
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next?.startsWith('/')) return null;
  try {
    const base = 'https://this.app';
    const url = new URL(next, base);
    return url.origin === base ? `${url.pathname}${url.search}` : null;
  } catch {
    return null;
  }
}

export function pathAfterLogin(role: Role, next: string | null | undefined): string {
  const safe = safeNextPath(next);
  if (safe && safe !== '/login' && canAccess(role, safe)) return safe;
  return ROLE_HOME[role];
}
