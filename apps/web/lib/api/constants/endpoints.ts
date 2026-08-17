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
    CRM_KPIS: '/dashboard/crm-kpis',
  },
  USERS: {
    GET_ALL: '/users',
    INVITE: '/users/invite',
  },
  CONTACTS: {
    GET_ALL: '/contacts',
    CREATE: '/contacts',
    UPDATE: (id: string) => `/contacts/${id}`,
  },
  LEADS: {
    GET_ALL: '/leads',
    CREATE: '/leads',
    UPDATE: (id: string) => `/leads/${id}`,
    UPDATE_STAGE: (id: string) => `/leads/${id}/stage`,
    GET_DETAILS: (id: string) => `/leads/${id}`,
  },
  ACTIVITIES: {
    GET_ALL: '/activities',
    CREATE: '/activities',
    UPDATE: (id: string) => `/activities/${id}`,
  },
  DEALS: {
    GET_ALL: '/deals',
    CREATE: '/deals',
    UPDATE: (id: string) => `/deals/${id}`,
    UPDATE_STAGE: (id: string) => `/deals/${id}/stage`,
    GET_DETAILS: (id: string) => `/deals/${id}`,
  },
} as const;
