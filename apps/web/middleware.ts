import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { isProtectedPath, safeNextPath } from '@/lib/auth/routing';

// only checks that a cookie exists, the role check happens in the app shell and the API
export function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if ((pathname === '/login' || pathname === '/register') && hasSession) {
    const next = safeNextPath(searchParams.get('next')) ?? '/';
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!hasSession && (pathname === '/' || isProtectedPath(pathname))) {
    const login = new URL('/login', request.url);
    if (pathname !== '/') login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/leave/:path*',
    '/manager/:path*',
    '/admin/:path*',
  ],
};
