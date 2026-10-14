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
    name: 'Demo',
    role: 'user',
    deliveryAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    saveDeliveryAddress: jest.fn(),
    toPublic: jest.fn((user: User) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      deliveryAddress: user.deliveryAddress ?? null,
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
    it('creates a user and sets the auth cookie', async () => {
      const created = makeUser({ passwordHash: 'hash' });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(created);
      const res = { cookie: jest.fn() } as unknown as Response;

      const result = await service.register(
        {
          email: 'user@example.com',
          password: 'password123',
          name: 'Demo',
        },
        res,
      );

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          name: 'Demo',
          role: 'user',
        }),
      );
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
      expect(result).toEqual({
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
        deliveryAddress: null,
      });
    });

    it('throws ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(
        service.register(
          {
            email: 'user@example.com',
            password: 'password123',
            name: 'Demo',
          },
          res,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('maps Postgres unique violations to ConflictException', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const driverError = Object.assign(new Error('duplicate key'), {
        code: '23505',
      });
      usersService.create.mockRejectedValue(
        new QueryFailedError('INSERT', [], driverError),
      );
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(
        service.register(
          {
            email: 'user@example.com',
            password: 'password123',
            name: 'Demo',
          },
          res,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('sets an httpOnly cookie and returns the public user', async () => {
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
      expect(result.email).toBe(user.email);
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

  describe('saveDeliveryAddress', () => {
    it('delegates to the users service', async () => {
      const updated = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'user@example.com',
        name: 'Demo',
        role: 'user' as const,
        deliveryAddress: '21 MG Road, Indore',
      };
      usersService.saveDeliveryAddress.mockResolvedValue(updated);

      await expect(service.saveDeliveryAddress(updated.id, '21 MG Road, Indore')).resolves.toEqual(
        updated,
      );
      expect(usersService.saveDeliveryAddress).toHaveBeenCalledWith(
        updated.id,
        '21 MG Road, Indore',
      );
    });
  });

  describe('logout', () => {
    it('clears the auth cookie', () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      expect(service.logout(res)).toEqual({ ok: true });
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });
  });
});
