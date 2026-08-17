/**
 * Centralized API Endpoint Constants for single-sourced request routing.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  HEALTH: {
    CHECK: '/health',
  },
  DOCTORS: {
    LIST: '/doctors',
    BY_ID: (id: string) => `/doctors/${id}`,
    SLOTS: (id: string) => `/doctors/${id}/slots`,
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    BY_ID: (id: string) => `/appointments/${id}`,
    CREATE: '/appointments',
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
    // Multi-step transaction endpoints
    CHECK_AVAILABILITY: '/appointments/check-availability',
    LOCK_SLOT: '/appointments/lock-slot',
    CONFIRM_BOOKING: '/appointments/confirm-booking',
  },
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
  },
} as const;
