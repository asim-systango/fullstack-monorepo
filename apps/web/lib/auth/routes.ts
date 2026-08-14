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
  myFines: '/my/fines',
  profile: '/profile',
  changePassword: '/change-password',
  librarian: '/librarian',
  admin: '/admin',
} as const;

export function bookDetailPath(id: string): string {
  return `${ROUTES.books}/${id}`;
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
  ROUTES.books,
  ROUTES.myLoans,
  ROUTES.myReservations,
  ROUTES.myFines,
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
