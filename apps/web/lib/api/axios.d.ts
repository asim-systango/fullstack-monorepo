import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, 401 interceptor skips login redirect (e.g. /auth/me bootstrap). */
    skipAuthRedirect?: boolean;
  }
}
