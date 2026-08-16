import type { AxiosInstance } from 'axios';
import { authTokensSchema, userSchema, type AuthTokens, type User } from '@shared/types';
import { unwrapData } from './unwrap';

export function createAuthApi(client: AxiosInstance) {
  return {
    async login(input: { email: string; password: string }): Promise<AuthTokens> {
      const { data } = await client.post('/auth/login', input);
      return authTokensSchema.parse(unwrapData(data));
    },
    async refresh(input: { refreshToken: string }): Promise<AuthTokens> {
      const { data } = await client.post('/auth/refresh', input);
      return authTokensSchema.parse(unwrapData(data));
    },
    async register(input: {
      email: string;
      password: string;
      name: string;
    }): Promise<User> {
      const { data } = await client.post('/auth/register', input);
      return userSchema.parse(unwrapData(data));
    },
    async verifyOtp(input: { email: string; otp: string }): Promise<User> {
      const { data } = await client.post('/auth/verify-otp', input);
      return userSchema.parse(unwrapData(data));
    },
    async resendOtp(input: {
      email: string;
      purpose?: 'signup' | 'password_reset';
    }): Promise<void> {
      await client.post('/auth/resend-otp', input);
    },
    async forgotPassword(input: { email: string }): Promise<void> {
      await client.post('/auth/forgot-password', input);
    },
    async resetPassword(input: {
      email: string;
      otp: string;
      newPassword: string;
    }): Promise<void> {
      await client.post('/auth/reset-password', input);
    },
    async me(): Promise<User> {
      const { data } = await client.get('/auth/me');
      return userSchema.parse(unwrapData(data));
    },
    async updateMe(input: { email?: string; name?: string }): Promise<User> {
      const { data } = await client.patch('/auth/me', input);
      return userSchema.parse(unwrapData(data));
    },
    async changePasswordOtp(input: { currentPassword: string }): Promise<void> {
      await client.post('/auth/change-password/otp', input);
    },
    async changePassword(input: {
      currentPassword: string;
      newPassword: string;
      otp: string;
    }): Promise<void> {
      await client.post('/auth/change-password', input);
    },
    async logout(input?: { refreshToken?: string }): Promise<void> {
      await client.post('/auth/logout', input ?? {});
    },
  };
}
