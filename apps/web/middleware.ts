import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { getHomeHref } from './lib/role-home';

/** Routes only the `user` role may see. */
const USER_ONLY_PREFIXES = ['/workouts', '/prs', '/plans', '/goals', '/dashboard'];
/** Routes only the `staff` (coach) role may see. */
const STAFF_ONLY_PREFIXES = ['/coach'];
/** Routes only the `admin` role may see. */
const ADMIN_ONLY_PREFIXES = ['/admin'];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Reads the `role` claim only, for UI gating — the domain API is the real
 * authorization boundary (`@Roles` guards). No signature check needed here.
 */
function readRoleClaim(token: string): string | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(
      normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='),
    );
    const claims: unknown = JSON.parse(decoded);
    if (claims && typeof claims === 'object' && 'role' in claims) {
      return String((claims as { role: unknown }).role);
    }
    return null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasSession = Boolean(token);

  if ((pathname === '/login' || pathname === '/register') && hasSession) {
    return NextResponse.redirect(
      new URL(getHomeHref(readRoleClaim(token!)), request.url),
    );
  }

  if (pathname === '/') {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const home = getHomeHref(readRoleClaim(token!));
    if (home !== '/') {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  const requiresUser = matchesPrefix(pathname, USER_ONLY_PREFIXES);
  const requiresStaff = matchesPrefix(pathname, STAFF_ONLY_PREFIXES);
  const requiresAdmin = matchesPrefix(pathname, ADMIN_ONLY_PREFIXES);

  if (requiresUser || requiresStaff || requiresAdmin) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    const role = readRoleClaim(token);
    const allowed =
      (requiresUser && role === 'user') ||
      (requiresStaff && role === 'staff') ||
      (requiresAdmin && role === 'admin');

    if (!allowed) {
      return NextResponse.rewrite(new URL('/access-denied', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/workouts/:path*',
    '/prs/:path*',
    '/plans/:path*',
    '/goals/:path*',
    '/coach/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
