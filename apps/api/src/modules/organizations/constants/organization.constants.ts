export const ORGANIZATION_ERRORS = {
  DOMAIN_ALREADY_EXISTS: 'Organization domain is already registered.',
  SLUG_ALREADY_EXISTS: 'Organization slug is already registered.',
  ADMIN_EMAIL_ALREADY_EXISTS:
    'Organization admin email is already registered in the system.',
  ORG_ADMIN_ROLE_NOT_FOUND: 'System role for Organization Admin was not found.',
  INVALID_ORGANIZATION_NAME: 'Organization name must be at least 2 characters long.',
  UNEXPECTED_ERROR: 'An unexpected error occurred while onboarding the organization.',
} as const;

export const ORGANIZATION_MESSAGES = {
  ORGANIZATION_ONBOARDED:
    'Organization onboarded successfully and admin invitation sent.',
} as const;
