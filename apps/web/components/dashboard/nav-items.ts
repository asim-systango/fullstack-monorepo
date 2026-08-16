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

const STAFF_CATALOG_ITEMS: readonly NavItem[] = [
  { href: ROUTES.librarianBooks, label: 'Books' },
  { href: ROUTES.librarianBooksNew, label: 'Add Book' },
  { href: ROUTES.librarianBooksAddCopy, label: 'Add Copies' },
];

const STAFF_CIRCULATION_ITEMS: readonly NavItem[] = [
  { href: ROUTES.librarianCheckoutRequests, label: 'Checkout Requests' },
  { href: ROUTES.librarianCheckout, label: 'Checkout Book' },
  { href: ROUTES.librarianReturns, label: 'Return Book' },
  { href: ROUTES.librarianOverdue, label: 'Overdue' },
];

export const STAFF_NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [{ href: ROUTES.dashboard, label: 'Dashboard' }],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: STAFF_CATALOG_ITEMS,
  },
  {
    id: 'circulation',
    label: 'Circulation',
    items: STAFF_CIRCULATION_ITEMS,
  },
  {
    id: 'members',
    label: 'Members',
    items: [{ href: ROUTES.librarianMembers, label: 'Find Members' }],
  },
] as const;

export const ADMIN_NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { href: ROUTES.dashboard, label: 'Dashboard' },
      { href: ROUTES.admin, label: 'Administration' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: STAFF_CATALOG_ITEMS,
  },
  {
    id: 'policies',
    label: 'Library Policies',
    items: [{ href: ROUTES.adminPolicies, label: 'Policies' }],
  },
  {
    id: 'members',
    label: 'Members',
    items: [
      { href: ROUTES.librarianMembers, label: 'Find Members' },
      { href: ROUTES.adminMembers, label: 'Members' },
      { href: ROUTES.adminLibrarians, label: 'Librarians' },
      { href: ROUTES.adminSuspended, label: 'Suspend / Restore' },
    ],
  },
  {
    id: 'fines',
    label: 'Fines',
    items: [{ href: ROUTES.adminFines, label: 'Fines' }],
  },
] as const;

export const MEMBER_NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'library',
    label: 'Library',
    items: [
      { href: ROUTES.dashboard, label: 'Overview' },
      { href: ROUTES.books, label: 'Browse Books' },
      { href: ROUTES.myCheckoutRequests, label: 'Checkout Requests' },
      { href: ROUTES.myLoans, label: 'My Loans' },
      { href: ROUTES.myReservations, label: 'My Reservations' },
      { href: ROUTES.myFines, label: 'My Fines' },
      { href: ROUTES.about, label: 'About' },
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
  [ROUTES.myCheckoutRequests]: 'Checkout Requests',
  [ROUTES.myReservations]: 'My Reservations',
  [ROUTES.myFines]: 'My Fines',
  [ROUTES.about]: 'About',
  [ROUTES.profile]: 'Profile',
  [ROUTES.changePassword]: 'Change Password',
  [ROUTES.librarian]: 'Librarian Desk',
  [ROUTES.librarianBooks]: 'Books',
  [ROUTES.librarianBooksNew]: 'Add Book',
  [ROUTES.librarianBooksAddCopy]: 'Add Copies',
  [ROUTES.librarianCheckout]: 'Checkout Book',
  [ROUTES.librarianReturns]: 'Return Book',
  [ROUTES.librarianOverdue]: 'Overdue',
  [ROUTES.librarianMembers]: 'Find Members',
  [ROUTES.librarianCheckoutRequests]: 'Checkout Requests',
  [ROUTES.admin]: 'Administration',
  [ROUTES.adminMembers]: 'Members',
  [ROUTES.adminLibrarians]: 'Librarians',
  [ROUTES.adminSuspended]: 'Suspend / Restore',
  [ROUTES.adminPolicies]: 'Library Policies',
  [ROUTES.adminFines]: 'Fines',
};

export function pageTitleForPath(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith(`${ROUTES.books}/`)) return 'Book details';
  if (pathname.startsWith(`${ROUTES.librarianCheckoutRequests}/`)) return 'Issue book';
  if (pathname.startsWith(`${ROUTES.librarianBooks}/`)) return 'Book details';
  if (pathname.startsWith(`${ROUTES.librarianMembers}/`)) return 'Member';
  return 'Bookly';
}
