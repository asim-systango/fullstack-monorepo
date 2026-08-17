export enum JwtTokenType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCESS = 'ACCESS',
}

export const AUTH_EXPIRATION = {
  PASSWORD_RESET_TOKEN: '15m',
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  EXPIRED_RESET_TOKEN: 'EXPIRED_RESET_TOKEN',
  SAME_PASSWORD_ERROR: 'SAME_PASSWORD_ERROR',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

export const AUTH_MESSAGES = {
  FORGOT_PASSWORD_SENT:
    'If an account exists with that email, a password reset link has been sent.',
  PASSWORD_RESET_SUCCESS:
    'Password has been reset successfully. Please log in with your new password.',
  PASSWORD_CHANGED_SUCCESS: 'Password updated successfully.',
} as const;
