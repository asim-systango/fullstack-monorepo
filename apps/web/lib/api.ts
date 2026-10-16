import {
  createApiClient,
  createAuthApi,
  createBooksApi,
  createBookCopiesApi,
  createDashboardApi,
  createFinesApi,
  createLoansApi,
  createMembersApi,
  createReservationsApi,
  createCheckoutRequestsApi,
  createSettingsApi,
  createUsersApi,
} from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';
import { GUEST_AUTH_PATHS, ROUTES } from './auth/routes';
import { getSafeNextPath } from './auth/safe-next';

const baseURL = resolveApiBaseUrl();

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const { pathname, search } = window.location;
  if (GUEST_AUTH_PATHS.some((path) => pathname === path)) return;
  const next = getSafeNextPath(`${pathname}${search}`);
  const params = new URLSearchParams({ next });
  window.location.assign(`${ROUTES.login}?${params.toString()}`);
}

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: redirectToLogin,
});

export const authApi = createAuthApi(apiClient);
export const booksApi = createBooksApi(apiClient);
export const bookCopiesApi = createBookCopiesApi(apiClient);
export const loansApi = createLoansApi(apiClient);
export const reservationsApi = createReservationsApi(apiClient);
export const checkoutRequestsApi = createCheckoutRequestsApi(apiClient);
export const finesApi = createFinesApi(apiClient);
export const membersApi = createMembersApi(apiClient);
export const settingsApi = createSettingsApi(apiClient);
export const dashboardApi = createDashboardApi(apiClient);
export const usersApi = createUsersApi(apiClient);
