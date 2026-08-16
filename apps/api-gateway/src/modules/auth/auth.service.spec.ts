import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserStatus } from '../../database/entities/user.entity';
import { Organization, OrganizationStatus } from '../../database/entities/organization.entity';
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

    it('handles organizationSlug and valid org context', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, status: UserStatus.ACTIVE, organizationId: 'org-1' });
      userRepository.findOne.mockResolvedValue(user);
      orgRepository.findOne.mockResolvedValue({
        id: 'org-1',
        name: 'Acme',
        slug: 'acme',
        status: OrganizationStatus.ACTIVE,
        primaryDomain: 'acme.com',
      });

      const res = { cookie: jest.fn() } as unknown as Response;

      const result = await service.login({ email: user.email, password, organizationSlug: 'acme' }, res);

      expect(userRepository.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { email: user.email, organization: { slug: 'acme' } },
      }));
      expect(result.organization?.name).toBe('Acme');
    });

    it('throws error if user is inactive', async () => {
      const user = makeUser({ status: UserStatus.INACTIVE });
      userRepository.findOne.mockResolvedValue(user);
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(service.login({ email: user.email, password: 'x' }, res)).rejects.toThrow('User account is inactive');
    });

    it('throws error if password is invalid', async () => {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('realpass', 4);
      const user = makeUser({ passwordHash, status: UserStatus.ACTIVE });
      userRepository.findOne.mockResolvedValue(user);
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(service.login({ email: user.email, password: 'wrongpass' }, res)).rejects.toThrow();
    });

    it('returns passwordResetToken if isPasswordChangeRequired is true', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, status: UserStatus.ACTIVE, isPasswordChangeRequired: true });
      userRepository.findOne.mockResolvedValue(user);

      const res = { cookie: jest.fn() } as unknown as Response;

      const result = await service.login({ email: user.email, password }, res);

      expect(result.isPasswordChangeRequired).toBe(true);
      expect(result.accessToken).toBeNull();
      expect(result.passwordResetToken).toBe('jwt-token');
    });

    it('throws error if user organization is inactive', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, status: UserStatus.ACTIVE, organizationId: 'org-1' });
      userRepository.findOne.mockResolvedValue(user);
      orgRepository.findOne.mockResolvedValue({ id: 'org-1', status: OrganizationStatus.SUSPENDED });

      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(service.login({ email: user.email, password }, res)).rejects.toThrow('Organization account is inactive');
    });

    it('throws error if organizationSlug does not match organization', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, status: UserStatus.ACTIVE, organizationId: 'org-1' });
      userRepository.findOne.mockResolvedValue(user);
      orgRepository.findOne.mockResolvedValue({ id: 'org-1', slug: 'other-slug', status: OrganizationStatus.ACTIVE });

      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(service.login({ email: user.email, password, organizationSlug: 'acme' }, res)).rejects.toThrow('Organization mismatch');
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
