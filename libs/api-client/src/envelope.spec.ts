import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { userSchema } from '@shared/types';
import { createAuthApi, unwrapData } from './index';

const sampleUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'user@fullstack.local',
  name: 'Demo User',
  role: 'user' as const,
};

describe('unwrapData', () => {
  it('unwraps Nest { data: T } envelopes', () => {
    expect(unwrapData({ data: sampleUser })).toEqual(sampleUser);
  });

  it('passes through non-envelope payloads', () => {
    expect(unwrapData(sampleUser)).toEqual(sampleUser);
  });
});

describe('createAuthApi envelope smoke', () => {
  it('parses login when the API returns { data: User }', async () => {
    const client = axios.create({
      adapter: async (config) =>
        ({
          data: { data: sampleUser },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config as InternalAxiosRequestConfig,
        }) satisfies AxiosResponse,
    });

    const auth = createAuthApi(client);
    await expect(
      auth.login({ email: 'user@fullstack.local', password: 'password123' }),
    ).resolves.toEqual(sampleUser);
  });

  it('fails if the client parses the envelope without unwrapping', async () => {
    const enveloped = { data: sampleUser };
    expect(userSchema.safeParse(enveloped).success).toBe(false);
    expect(userSchema.safeParse(unwrapData(enveloped)).success).toBe(true);
  });
});
