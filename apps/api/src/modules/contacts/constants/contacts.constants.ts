export const CONTACTS_ERRORS = {
  USER_NO_ORG: 'User does not belong to any organization',
  EMAIL_EXISTS: 'Contact with this email already exists in your organization',
  PHONE_EXISTS: 'Contact with this phone number already exists in your organization',
  CONTACT_NOT_FOUND: 'Contact not found or you do not have permission to access it',
  UNEXPECTED_ERROR: 'An unexpected error occurred during contact processing.',
} as const;

export const CONTACTS_MESSAGES = {
  CONTACT_CREATED: 'Contact created successfully.',
  CONTACTS_RETRIEVED: 'Contacts retrieved successfully.',
  CONTACT_UPDATED: 'Contact updated successfully.',
} as const;
