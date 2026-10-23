export enum TokenType {
  BEARER = 'Bearer',
}

export enum JwtTokenType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCESS = 'ACCESS',
}

export const AUTH_COOKIE = {
  NAME: 'access_token',
  MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  ORGANIZATION_INACTIVE: 'ORGANIZATION_INACTIVE',
  ORGANIZATION_MISMATCH: 'ORGANIZATION_MISMATCH',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'User logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_CHANGE_REQUIRED_LOGIN: 'Password change is required before logging in.',
} as const;
