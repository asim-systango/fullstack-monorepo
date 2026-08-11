import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService, type User, type PublicUser } from '../../users';
import { Role } from '../../users/user.entity';

describe('JwtStrategy (gateway)', () => {
  const usersService = {
    findById: jest.fn(),
    toPublic: jest.fn((user: User): PublicUser => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
    const user: User = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      passwordHash: 'hash',
      firstName: 'Demo',
      lastName: 'User',
      name: 'Demo User',
      phone: '+1234567890',
      role: Role.PATIENT,
      isActive: true,
      emailVerified: true,
      hashedRefreshToken: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      deletedAt: null,
    };
    usersService.findById.mockResolvedValue(user);

    await expect(
      strategy.validate({
        sub: user.id,
        email: user.email,
        role: Role.PATIENT,
      }),
    ).resolves.toEqual({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  it('throws UnauthorizedException when the subject is missing', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(
      strategy.validate({
        sub: 'missing',
        email: 'x@example.com',
        role: 'PATIENT',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
