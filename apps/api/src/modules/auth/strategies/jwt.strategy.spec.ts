import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy (api)', () => {
  const originalEnv = { ...process.env };
  let strategy: JwtStrategy;

  beforeAll(() => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5434/app',
      JWT_SECRET: 'test-jwt-secret-16',
      JWT_EXPIRES_IN: '1h',
      PORT: '3002',
    });
    strategy = new JwtStrategy();
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it('maps valid Bearer claims to JwtUser', () => {
    expect(
      strategy.validate({
        sub: '11111111-1111-1111-1111-111111111111',
        email: 'user@example.com',
        role: 'user',
      }),
    ).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      role: 'user',
    });
  });

  it('rejects invalid role claims', () => {
    expect(() =>
      strategy.validate({
        sub: '11111111-1111-1111-1111-111111111111',
        email: 'user@example.com',
        role: 'superadmin',
      }),
    ).toThrow(UnauthorizedException);
  });

  it('rejects missing subject', () => {
    expect(() =>
      strategy.validate({
        sub: '',
        email: 'user@example.com',
        role: 'user',
      }),
    ).toThrow(UnauthorizedException);
  });
});
