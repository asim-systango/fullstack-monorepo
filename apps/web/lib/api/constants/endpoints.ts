export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
  },
  ORGANIZATIONS: {
    ONBOARD: '/organizations/onboard',
    GET_ALL: '/organizations',
  },
  FORMS: {
    ONBOARDING_REQUEST: '/forms/onboarding-request',
    SUBMISSIONS: '/forms/submissions',
    SUBMISSION_STATUS: (id: string) => `/forms/submissions/${id}/status`,
  },
  DASHBOARD: {
    OVERALL_KPIS: '/dashboard/overall-kpis',
  },
} as const;
