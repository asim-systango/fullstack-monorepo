export const DEALS_ERRORS = {
  USER_NO_ORG: 'User does not belong to any organization',
  LEAD_NOT_FOUND: 'Lead not found or does not belong to your organization',
  CONTACT_NOT_FOUND: 'Contact not found or does not belong to your organization',
  OWNER_NOT_FOUND: 'Assigned owner not found or does not belong to your organization',
  UNAUTHORIZED_ACCESS: 'You are not authorized to convert this lead or assign deals',
  LEAD_ALREADY_CONVERTED: 'Lead has already been converted to a deal',
  UNEXPECTED_ERROR: 'An unexpected error occurred during deal processing.',
} as const;

export const DEALS_MESSAGES = {
  DEAL_CREATED: 'Deal created successfully.',
} as const;
