import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { userSchema } from '@shared/types';
import { createAuthApi, createHealthApi, unwrapData } from './index';

const sampleUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'user@demo.local',
  name: 'Demo User',
  role: 'user' as const,
};

const sampleTokens = {
  user: sampleUser,
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

function mockClient(payload: unknown) {
  return axios.create({
    adapter: async (config) =>
      ({
        data: { data: payload },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as InternalAxiosRequestConfig,
      }) satisfies AxiosResponse,
  });
}

describe('unwrapData', () => {
  it('unwraps Nest { data: T } envelopes', () => {
    expect(unwrapData({ data: sampleUser })).toEqual(sampleUser);
  });

  it('passes through non-envelope payloads', () => {
    expect(unwrapData(sampleUser)).toEqual(sampleUser);
  });
});

describe('createAuthApi envelope smoke', () => {
  it('parses login when the API returns { data: AuthTokens }', async () => {
    const auth = createAuthApi(mockClient(sampleTokens));
    await expect(
      auth.login({ email: 'user@demo.local', password: 'password123' }),
    ).resolves.toEqual(sampleTokens);
  });

  it('parses refresh tokens', async () => {
    const auth = createAuthApi(mockClient(sampleTokens));
    await expect(auth.refresh({ refreshToken: 'refresh-token' })).resolves.toEqual(
      sampleTokens,
    );
  });

  it('parses register / verify / me / updateMe as a User', async () => {
    const auth = createAuthApi(mockClient(sampleUser));
    await expect(
      auth.register({
        email: 'user@demo.local',
        password: 'password123',
        name: 'Demo User',
      }),
    ).resolves.toEqual(sampleUser);
    await expect(
      auth.verifyOtp({ email: 'user@demo.local', otp: '123456' }),
    ).resolves.toEqual(sampleUser);
    await expect(auth.me()).resolves.toEqual(sampleUser);
    await expect(auth.updateMe({ name: 'Demo User' })).resolves.toEqual(sampleUser);
  });

  it('posts void auth actions', async () => {
    const auth = createAuthApi(mockClient({ ok: true }));
    await expect(auth.resendOtp({ email: 'user@demo.local' })).resolves.toBeUndefined();
    await expect(auth.forgotPassword({ email: 'user@demo.local' })).resolves.toBeUndefined();
    await expect(
      auth.resetPassword({
        email: 'user@demo.local',
        otp: '123456',
        newPassword: 'password123',
      }),
    ).resolves.toBeUndefined();
    await expect(
      auth.changePasswordOtp({ currentPassword: 'password123' }),
    ).resolves.toBeUndefined();
    await expect(
      auth.changePassword({
        currentPassword: 'password123',
        newPassword: 'password456',
        otp: '123456',
      }),
    ).resolves.toBeUndefined();
    await expect(auth.logout({ refreshToken: 'refresh-token' })).resolves.toBeUndefined();
    await expect(auth.logout()).resolves.toBeUndefined();
  });

  it('fails if the client parses the envelope without unwrapping', async () => {
    const enveloped = { data: sampleUser };
    expect(userSchema.safeParse(enveloped).success).toBe(false);
    expect(userSchema.safeParse(unwrapData(enveloped)).success).toBe(true);
  });
});

describe('createHealthApi', () => {
  it('parses the health envelope', async () => {
    const health = createHealthApi(mockClient({ status: 'ok' }));
    await expect(health.check()).resolves.toEqual({ status: 'ok' });
  });
});
