export const DASHBOARD_ERRORS = {
  USER_NO_ORG: 'User does not belong to an organization.',
  UNAUTHORIZED_ACCESS: 'You do not have permission to view dashboard data.',
  FETCH_FAILED: 'Failed to retrieve dashboard metrics.',
} as const;

export const DASHBOARD_MESSAGES = {
  OVERALL_KPIS_RETRIEVED: 'Overall KPI metrics retrieved successfully.',
  CRM_KPIS_RETRIEVED: 'Workspace CRM KPI metrics retrieved successfully.',
} as const;
