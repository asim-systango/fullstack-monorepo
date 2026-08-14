export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login', // Gateway handles this without /v1
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/v1/auth/reset-password',
  },
  ORGANIZATIONS: {
    ONBOARD: '/v1/organizations/onboard',
    GET_ALL: '/v1/organizations',
  },
  FORMS: {
    ONBOARDING_REQUEST: '/v1/forms/onboarding-request',
    SUBMISSIONS: '/v1/forms/submissions',
    SUBMISSION_STATUS: (id: string) => `/v1/forms/submissions/${id}/status`,
  },
  DASHBOARD: {
    OVERALL_KPIS: '/v1/dashboard/overall-kpis',
  },
} as const;
