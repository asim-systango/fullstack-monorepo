import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy (gateway)', () => {
  const originalEnv = { ...process.env };
  let strategy: JwtStrategy;

  beforeAll(() => {
    Object.assign(process.env, {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5434/app',
      JWT_SECRET: 'test-jwt-secret-16',
      JWT_EXPIRES_IN: '1h',
      COOKIE_SECURE: 'false',
      CORS_ORIGIN: 'http://localhost:3000',
      API_UPSTREAM_URL: 'http://localhost:3002',
    });
    strategy = new JwtStrategy();
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it('returns the parsed user representation when the payload has sub', async () => {
    const payload = {
      sub: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      organizationId: 'org-123',
      role: 'user',
    };

    await expect(strategy.validate(payload)).resolves.toEqual({
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role,
    });
  });

  it('throws UnauthorizedException when payload or sub is missing', async () => {
    await expect(strategy.validate({} as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
