import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { ROUTES, isGuestAuthPath, isProtectedPath } from './lib/auth/routes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isGuestAuthPath(pathname) && hasSession) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/dashboard',
    '/dashboard/:path*',
    '/books',
    '/books/:path*',
    '/my/loans',
    '/my/loans/:path*',
    '/my/reservations',
    '/my/reservations/:path*',
    '/my/fines',
    '/my/fines/:path*',
    '/profile',
    '/profile/:path*',
    '/change-password',
    '/change-password/:path*',
    '/librarian',
    '/librarian/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
