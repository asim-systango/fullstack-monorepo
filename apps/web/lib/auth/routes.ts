export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyOtp: '/verify-otp',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  books: '/books',
  myLoans: '/my/loans',
  myReservations: '/my/reservations',
  myCheckoutRequests: '/my/checkout-requests',
  myFines: '/my/fines',
  about: '/about',
  profile: '/profile',
  changePassword: '/change-password',
  librarian: '/librarian',
  librarianBooks: '/librarian/books',
  librarianBooksNew: '/librarian/books/new',
  librarianBooksAddCopy: '/librarian/books/add-copy',
  librarianCheckout: '/librarian/checkout',
  librarianReturns: '/librarian/returns',
  librarianOverdue: '/librarian/overdue',
  librarianMembers: '/librarian/members',
  librarianCheckoutRequests: '/librarian/checkout-requests',
  admin: '/admin',
  adminMembers: '/admin/members',
  adminLibrarians: '/admin/librarians',
  adminSuspended: '/admin/suspended',
  adminPolicies: '/admin/policies',
  adminFines: '/admin/fines',
} as const;

export function bookDetailPath(id: string): string {
  return `${ROUTES.books}/${id}`;
}

export function librarianBookPath(id: string): string {
  return `${ROUTES.librarianBooks}/${id}`;
}

export function librarianMemberPath(userId: string): string {
  return `${ROUTES.librarianMembers}/${userId}`;
}

export function librarianCheckoutRequestPath(id: string): string {
  return `${ROUTES.librarianCheckoutRequests}/${id}`;
}

export function librarianCheckoutPath(memberId?: string): string {
  if (!memberId) return ROUTES.librarianCheckout;
  return `${ROUTES.librarianCheckout}?memberId=${encodeURIComponent(memberId)}`;
}

export function librarianReturnsPath(memberId?: string): string {
  if (!memberId) return ROUTES.librarianReturns;
  return `${ROUTES.librarianReturns}?memberId=${encodeURIComponent(memberId)}`;
}

export const GUEST_AUTH_PATHS = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.verifyOtp,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
] as const;

export const PROTECTED_PATHS = [
  ROUTES.dashboard,
  ROUTES.myLoans,
  ROUTES.myReservations,
  ROUTES.myCheckoutRequests,
  ROUTES.myFines,
  ROUTES.about,
  ROUTES.profile,
  ROUTES.changePassword,
  ROUTES.librarian,
  ROUTES.admin,
] as const;

export function isGuestAuthPath(pathname: string): boolean {
  return GUEST_AUTH_PATHS.some((path) => pathname === path);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** Guest-browsable member catalog (not `/librarian/books`). */
export function isPublicCatalogPath(pathname: string): boolean {
  return pathname === ROUTES.books || pathname.startsWith(`${ROUTES.books}/`);
}
