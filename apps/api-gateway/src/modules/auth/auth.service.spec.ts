import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserStatus } from '../../database/entities/user.entity';
import { Organization } from '../../database/entities/organization.entity';
import type { Response } from 'express';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: '',
    firstName: 'Demo',
    lastName: 'User',
    roleId: 'role-123',
    role: { id: 'role-123', name: 'user', createdAt: new Date(), updatedAt: new Date(), description: '' },
    organizationId: null,
    organization: null,
    status: UserStatus.ACTIVE,
    isPasswordChangeRequired: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

describe('AuthService', () => {
  const userRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const orgRepository = {
    findOne: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn().mockReturnValue('jwt-token'),
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
      userRepository as unknown as Repository<User>,
      orgRepository as unknown as Repository<Organization>,
      jwtService as unknown as JwtService,
    );
  });

  describe('login', () => {
    it('sets an httpOnly cookie and returns the public user for active users', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, status: UserStatus.ACTIVE });
      userRepository.findOne.mockResolvedValue(user);

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await service.login({ email: user.email, password }, res);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(user.id, expect.objectContaining({
        lastLoginAt: expect.any(Number),
      }));
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

    it('allows a PENDING user to login and updates status to ACTIVE', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, status: UserStatus.PENDING });
      userRepository.findOne.mockResolvedValue(user);

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await service.login({ email: user.email, password }, res);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(user.id, expect.objectContaining({
        lastLoginAt: expect.any(Number),
        status: UserStatus.ACTIVE,
      }));
      expect(res.cookie).toHaveBeenCalled();
      expect(result.user.email).toBe(user.email);
    });

    it('throws Error for bad credentials', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(
        service.login({ email: 'missing@example.com', password: 'x' }, res),
      ).rejects.toThrow();
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears the auth cookie', () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      expect(service.logout(res)).toEqual({ message: 'Logged out successfully' });
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });
  });
});
