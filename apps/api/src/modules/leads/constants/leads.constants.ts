export const LEADS_ERRORS = {
  USER_NO_ORG: 'User does not belong to any organization',
  CONTACT_NOT_FOUND: 'Contact not found or does not belong to your organization',
  OWNER_NOT_FOUND: 'Assigned owner not found or does not belong to your organization',
  UNAUTHORIZED_ACCESS: 'You are not authorized to assign leads',
  UNEXPECTED_ERROR: 'An unexpected error occurred during lead processing.',
} as const;

export const LEADS_MESSAGES = {
  LEAD_CREATED: 'Lead created successfully.',
} as const;
