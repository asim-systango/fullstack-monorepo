import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError, type User } from '@shared/api-client';
import { authApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { resetClientStores } from '@/lib/store';

async function fetchSessionUser(): Promise<User | null> {
  try {
    return await authApi.me();
  } catch (err) {
    if (err instanceof ApiClientError && err.statusCode === 401) {
      try {
        await authApi.logout();
      } catch {
        /* ignore logout failures while recovering from expired session */
      }
      return null;
    }
    throw err;
  }
}

export function useAuthMeQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchSessionUser,
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => authApi.login(input),
    onSuccess: (tokens) => {
      queryClient.setQueryData(queryKeys.auth.me, tokens.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      resetClientStores();
      queryClient.clear();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; name: string }) =>
      authApi.register(input),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; otp: string }) => authApi.verifyOtp(input),
    onSuccess: () => {
      // OTP verify does not set a session cookie.
      queryClient.setQueryData(queryKeys.auth.me, null);
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (input: { email: string; purpose?: 'signup' | 'password_reset' }) =>
      authApi.resendOtp(input),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: { email: string }) => authApi.forgotPassword(input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string; newPassword: string }) =>
      authApi.resetPassword(input),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(input),
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email?: string; name?: string }) => authApi.updateMe(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
    },
  });
}

export function setSessionUserCache(
  queryClient: ReturnType<typeof useQueryClient>,
  user: User | null,
): void {
  queryClient.setQueryData(queryKeys.auth.me, user);
}
