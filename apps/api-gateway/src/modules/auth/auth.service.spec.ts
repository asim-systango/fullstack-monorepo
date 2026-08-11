import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService, type User } from '../users';
import type { Response } from 'express';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: '',
    firstName: 'Demo',
    lastName: 'User',
    name: 'Demo User',
    role: 'PATIENT' as const,
    isActive: true,
    emailVerified: true,
    hashedRefreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByPhone: jest.fn(),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
    toPublic: jest.fn((user: User) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      role: user.role,
    })),
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('jwt-token'),
  };

  let service: AuthService;
  const originalEnv = { ...process.env };

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
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('creates a user on the happy path', async () => {
      const created = makeUser({ passwordHash: 'hash' });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.create.mockResolvedValue(created);

      const result = await service.register({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'User',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          firstName: 'Demo',
          lastName: 'User',
        }),
      );
      expect(result.user).toEqual({
        id: created.id,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
        name: created.name,
        role: created.role,
      });
    });

    it('throws ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'password123',
          firstName: 'Demo',
          lastName: 'User',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('maps Postgres unique violations to ConflictException', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);
      const driverError = Object.assign(new Error('duplicate key'), {
        code: '23505',
      });
      usersService.create.mockRejectedValue(
        new QueryFailedError('INSERT', [], driverError),
      );

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'password123',
          firstName: 'Demo',
          lastName: 'User',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('sets an httpOnly cookie and returns tokens and public user', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash });
      usersService.findByEmail.mockResolvedValue(user);

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await service.login({ email: user.email, password }, res);

      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
      expect(result.user.email).toBe(user.email);
    });

    it('throws UnauthorizedException for bad credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(
        service.login({ email: 'missing@example.com', password: 'x' }, res),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears the auth cookie', async () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await service.logout('11111111-1111-1111-1111-111111111111', res);
      expect(result).toEqual({ message: 'Successfully logged out' });
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });
  });
});
