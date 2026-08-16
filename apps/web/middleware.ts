import { NextResponse, type NextRequest } from 'next/server';
import { getDashboardPath, type GatewayRole } from '@/lib/auth/roles';

const AUTH_COOKIE_NAME = 'access_token';
const ME_TIMEOUT_MS = 3_000;

const PROTECTED_PREFIXES = ['/studio', '/editor', '/admin'] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isRoleAllowed(role: GatewayRole, pathname: string): boolean {
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    return role === 'user' || role === 'staff';
  }
  if (pathname === '/editor' || pathname.startsWith('/editor/')) {
    return role === 'staff';
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return role === 'admin';
  }
  return true;
}

function loginRedirect(request: NextRequest): NextResponse {
  const login = new URL('/login', request.url);
  login.searchParams.set(
    'redirect',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(login);
}

function unwrapMe(payload: unknown): { role?: string } | null {
  if (payload === null || typeof payload !== 'object') return null;
  const body = payload as { data?: unknown; role?: string };
  if (body.data !== null && typeof body.data === 'object') {
    return body.data as { role?: string };
  }
  return body;
}

function isGatewayRole(value: unknown): value is GatewayRole {
  return value === 'user' || value === 'staff' || value === 'admin';
}

/**
 * Cookie + /auth/me gate for studio/editor/admin.
 * The API remains the source of truth for every mutation.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    return loginRedirect(request);
  }

  const gatewayOrigin = (process.env.API_GATEWAY_URL ?? 'http://localhost:3001').replace(
    /\/$/,
    '',
  );

  try {
    const me = await fetch(`${gatewayOrigin}/auth/me`, {
      headers: {
        accept: 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(ME_TIMEOUT_MS),
    });
    if (!me.ok) {
      return loginRedirect(request);
    }

    const user = unwrapMe(await me.json());
    if (!user || !isGatewayRole(user.role)) {
      return loginRedirect(request);
    }

    if (!isRoleAllowed(user.role, pathname)) {
      return NextResponse.redirect(new URL(getDashboardPath(user.role), request.url));
    }
  } catch {
    return loginRedirect(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/studio',
    '/studio/:path*',
    '/editor',
    '/editor/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
