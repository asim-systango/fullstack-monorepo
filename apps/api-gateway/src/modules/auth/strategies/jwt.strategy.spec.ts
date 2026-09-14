import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService, type User } from '../../users';

describe('JwtStrategy (gateway)', () => {
  const usersService = {
    findById: jest.fn(),
    toPublic: jest.fn((user: User) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })),
  };

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
    strategy = new JwtStrategy(usersService as unknown as UsersService);
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the public user when the subject exists', async () => {
    const user = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      name: 'Demo',
      role: 'user',
      passwordHash: 'hash',
    } as User;
    usersService.findById.mockResolvedValue(user);

    await expect(
      strategy.validate({
        sub: user.id,
        email: user.email,
        role: 'user',
      }),
    ).resolves.toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  });

  it('throws UnauthorizedException when the subject is missing', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(
      strategy.validate({
        sub: 'missing',
        email: 'x@example.com',
        role: 'user',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
