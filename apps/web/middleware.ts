import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';

const PROTECTED_PREFIXES = ['/my', '/seller', '/admin', '/watchlist'] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if ((pathname === '/login' || pathname === '/register') && hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isProtected(pathname) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    const next = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/my/:path*',
    '/seller/:path*',
    '/admin/:path*',
    '/watchlist',
    '/watchlist/:path*',
  ],
};
