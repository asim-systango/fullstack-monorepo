/**
 * Centralised UI Error & Status Messages
 *
 * All user-facing notification, alert, and error strings are centralized
 * here to prevent magic string duplication and allow easy i18n/localization.
 */

export const AUTH_ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Please provide both email address and password.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  SERVER_ERROR: 'Something went wrong. Please check your connection or try again later.',
  UNEXPECTED_ERROR: 'Something went wrong. Please try again later.',
} as const;

export const SYSTEM_MESSAGES = {
  GENERIC_SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',
  NETWORK_CONNECTION_ERROR:
    'Unable to connect to server. Please check your network connection.',
} as const;
