export const ACTIVITIES_ERRORS = {
  USER_NO_ORG: 'User does not belong to any organization',
  LEAD_OR_DEAL_REQUIRED: 'Activity must be linked to either a Lead or a Deal',
  LEAD_NOT_FOUND: 'Lead not found or does not belong to your organization',
  DEAL_NOT_FOUND: 'Deal not found or does not belong to your organization',
  ACTIVITY_NOT_FOUND: 'Activity not found or does not belong to your organization',
  UNAUTHORIZED_ACCESS: 'You are not authorized to access or modify this activity',
  UNEXPECTED_ERROR: 'An unexpected error occurred during activity processing.',
} as const;

export const ACTIVITIES_MESSAGES = {
  ACTIVITY_CREATED: 'Activity created successfully.',
  ACTIVITIES_RETRIEVED: 'Activities retrieved successfully.',
  ACTIVITY_UPDATED: 'Activity updated successfully.',
} as const;
