import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { safeReturnPath } from '@/lib/return-url';

const PROTECTED_PREFIXES = [
  '/groups',
  '/activity',
  '/account',
  '/dashboard',
  '/expenses',
  '/balances',
  '/settlements',
  '/friends',
  '/help',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if ((pathname === '/login' || pathname === '/register') && hasSession) {
    const dest = safeReturnPath(request.nextUrl.searchParams.get('returnUrl'));
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (isProtected && !hasSession) {
    const login = new URL('/login', request.url);
    login.searchParams.set('returnUrl', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/groups/:path*',
    '/activity',
    '/account',
    '/dashboard',
    '/expenses',
    '/balances',
    '/settlements',
    '/friends',
    '/help',
  ],
};
