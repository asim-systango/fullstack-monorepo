import { ROUTES } from '@/lib/auth/routes';
import type { UserRole } from '@/lib/auth/roles';

export type NavItem = {
  href: string;
  label: string;
  roles?: readonly UserRole[];
};

export type NavSection = {
  id: string;
  label?: string;
  items: readonly NavItem[];
};

export const DASHBOARD_NAV: readonly NavItem[] = [
  { href: ROUTES.dashboard, label: 'Dashboard' },
  { href: ROUTES.librarian, label: 'Librarian', roles: ['staff', 'admin'] },
  { href: ROUTES.admin, label: 'Admin', roles: ['admin'] },
] as const;

export const STAFF_NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { href: ROUTES.dashboard, label: 'Dashboard' },
      { href: ROUTES.librarian, label: 'Librarian Desk' },
    ],
  },
] as const;

export const ADMIN_NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { href: ROUTES.dashboard, label: 'Dashboard' },
      { href: ROUTES.librarian, label: 'Librarian Desk' },
      { href: ROUTES.admin, label: 'Administration' },
    ],
  },
] as const;

export const MEMBER_NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'library',
    label: 'Library',
    items: [
      { href: ROUTES.dashboard, label: 'Overview' },
      { href: ROUTES.books, label: 'Browse Books' },
      { href: ROUTES.myLoans, label: 'My Loans' },
      { href: ROUTES.myReservations, label: 'My Reservations' },
      { href: ROUTES.myFines, label: 'My Fines' },
    ],
  },
] as const;

export function navItemsForRole(role: UserRole | undefined): NavItem[] {
  return DASHBOARD_NAV.filter(
    (item) => !item.roles || (role && item.roles.includes(role)),
  );
}

export function memberNavSections(): readonly NavSection[] {
  return MEMBER_NAV_SECTIONS;
}

export function staffNavSections(): readonly NavSection[] {
  return STAFF_NAV_SECTIONS;
}

export function adminNavSections(): readonly NavSection[] {
  return ADMIN_NAV_SECTIONS;
}

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.books]: 'Browse Books',
  [ROUTES.myLoans]: 'My Loans',
  [ROUTES.myReservations]: 'My Reservations',
  [ROUTES.myFines]: 'My Fines',
  [ROUTES.profile]: 'Profile',
  [ROUTES.changePassword]: 'Change password',
  [ROUTES.librarian]: 'Librarian Desk',
  [ROUTES.admin]: 'Administration',
};

export function pageTitleForPath(pathname: string): string {
  if (pathname.startsWith(`${ROUTES.books}/`)) return 'Book details';
  return PAGE_TITLES[pathname] ?? 'Bookly';
}
