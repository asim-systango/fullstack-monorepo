import type { User } from '@shared/types';

export type AppRole = User['role'];

/** JWT claims issued by api-gateway AuthService.login */
export type JwtPayload = {
  sub: string;
  email: string;
  role: AppRole;
  iat?: number;
  exp?: number;
};

const ROLE_SET = new Set<AppRole>(['admin', 'staff', 'user']);

function base64UrlToJson(segment: string): unknown {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLength);

  return JSON.parse(atob(base64)) as unknown;
}

function isAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && ROLE_SET.has(value as AppRole);
}

/**
 * Decode JWT payload without signature verification.
 * Used only for Next middleware route gating; the API still enforces auth.
 */
export function decodeAccessToken(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }

  try {
    const raw = base64UrlToJson(parts[1]);
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const { sub, email, role, iat, exp } = raw as Record<string, unknown>;
    if (typeof sub !== 'string' || typeof email !== 'string' || !isAppRole(role)) {
      return null;
    }

    if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      sub,
      email,
      role,
      ...(typeof iat === 'number' ? { iat } : {}),
      ...(typeof exp === 'number' ? { exp } : {}),
    };
  } catch {
    return null;
  }
}
