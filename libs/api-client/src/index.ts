import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
} from 'axios';
import { apiErrorSchema, type ApiErrorBody } from '@shared/types';

export {
  apiErrorSchema,
  userSchema,
  authTokensSchema,
  type ApiErrorBody,
  type User,
  type AuthTokens,
} from '@shared/types';

// Re-export Bookly domain types for app consumers
export type {
  Book,
  BookDetail,
  BookCopy,
  BookCopyStatus,
  CreateBookInput,
  UpdateBookInput,
  CreateBookCopyInput,
  UpdateBookCopyInput,
  ListBooksParams,
  ListBookCopiesParams,
  Loan,
  LoanWithRelations,
  OverdueLoan,
  ListLoansParams,
  LookupLoanParams,
  CheckoutLoanInput,
  LoanFilterStatus,
  Reservation,
  ReservationWithBook,
  CreateReservationInput,
  ListReservationsParams,
  ReservationStatus,
  CheckoutRequest,
  CheckoutRequestStatus,
  CreateCheckoutRequestInput,
  IssueCheckoutRequestInput,
  ListCheckoutRequestsParams,
  RejectCheckoutRequestInput,
  Fine,
  FineWithLoan,
  ListFinesParams,
  WaiveFineInput,
  FineStatus,
  MemberProfile,
  MemberListItem,
  MemberDetail,
  MemberSearchHit,
  MemberLoanSummary,
  ListMembersParams,
  SearchMembersParams,
  SuspendMemberInput,
  MemberStatus,
  AppSetting,
  UpdateSettingInput,
  PublicDashboard,
  MemberDashboard,
  LibrarianDashboard,
  AdminDashboard,
  Paginated,
  PaginationParams,
} from '@shared/types';

export { unwrapData } from './unwrap';
export { buildQueryParams } from './query-params';
export { createAuthApi } from './auth';
export { createHealthApi } from './health';
export {
  createBooksApi,
  createBookCopiesApi,
  createLoansApi,
  createReservationsApi,
  createCheckoutRequestsApi,
  createFinesApi,
  createMembersApi,
  createSettingsApi,
  createDashboardApi,
  createUsersApi,
} from './bookly';

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = body.statusCode;
    this.body = body;
  }
}

function toApiError(error: AxiosError): ApiClientError {
  const data = error.response?.data;
  const parsed = apiErrorSchema.safeParse(data);
  if (parsed.success) {
    return new ApiClientError(parsed.data);
  }
  return new ApiClientError({
    statusCode: error.response?.status ?? 500,
    error: 'UnknownError',
    message: error.message || 'Request failed',
  });
}

export type CreateApiClientOptions = CreateAxiosDefaults & {
  withCredentials?: boolean;
  onUnauthorized?: () => void;
};

/** Public or credential-check auth routes — a 401 is not a session expiry. */
const SKIP_UNAUTHORIZED_REDIRECT = [
  '/auth/me',
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/logout',
  '/auth/change-password',
] as const;

function shouldSkipUnauthorizedRedirect(url: string): boolean {
  return SKIP_UNAUTHORIZED_REDIRECT.some((path) => url.includes(path));
}

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const { onUnauthorized, ...axiosConfig } = options;
  const client = axios.create({
    timeout: 15_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    ...axiosConfig,
  });

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const apiError = toApiError(error);
      if (apiError.statusCode === 401) {
        const url = error.config?.url ?? '';
        if (!shouldSkipUnauthorizedRedirect(url)) {
          onUnauthorized?.();
        }
      }
      return Promise.reject(apiError);
    },
  );

  return client;
}
