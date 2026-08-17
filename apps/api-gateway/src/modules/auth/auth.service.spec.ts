import {
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService, type User } from '../users';
import { Role } from '../users/user.entity';
import type { Response, Request } from 'express';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: '',
    firstName: 'Demo',
    lastName: 'User',
    name: 'Demo User',
    phone: '+1234567890',
    role: Role.PATIENT,
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
    updatePassword: jest.fn(),
    updateProfile: jest.fn(),
    toPublic: jest.fn((user: User) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? 'Demo',
      lastName: user.lastName ?? 'User',
      name: user.name ?? 'Demo User',
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? null,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('jwt-token'),
    verifyAsync: jest.fn(),
  };

  let service: AuthService;
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

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
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('creates a patient user on the happy path', async () => {
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
      expect(result.user).toEqual(usersService.toPublic(created));
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

    it('throws ConflictException when phone already exists', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(makeUser());

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'password123',
          firstName: 'Demo',
          lastName: 'User',
          phone: '+1234567890',
        }),
      ).rejects.toThrow('Phone number already registered');
    });

    it('handles doctor registration and upstream sync success', async () => {
      const doctorUser = makeUser({ role: Role.DOCTOR });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByPhone.mockResolvedValue(null);
      usersService.create.mockResolvedValue(doctorUser);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const result = await service.register({
        email: 'doc@example.com',
        password: 'password123',
        firstName: 'Doc',
        lastName: 'Doctor',
        role: 'DOCTOR',
        specialization: 'Cardiology',
      });

      expect(result).toEqual({
        requiresApproval: true,
        message: expect.any(String),
        user: usersService.toPublic(doctorUser),
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/doctors',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('handles doctor registration when upstream sync fails silently', async () => {
      const doctorUser = makeUser({ role: Role.DOCTOR });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(doctorUser);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Upstream error'));

      const result = await service.register({
        email: 'doc@example.com',
        password: 'password123',
        firstName: 'Doc',
        lastName: 'Doctor',
        role: 'DOCTOR',
      });

      expect(result.requiresApproval).toBe(true);
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

    it('rethrows non-unique violation errors', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const dbErr = new Error('Connection failed');
      usersService.create.mockRejectedValue(dbErr);

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'password123',
          firstName: 'Demo',
          lastName: 'User',
        }),
      ).rejects.toThrow('Connection failed');
    });
  });

  describe('login', () => {
    it('sets httpOnly cookies and returns tokens and public user when res is passed', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash });
      usersService.findByEmail.mockResolvedValue(user);

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await service.login({ email: user.email, password }, res);

      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result.user.email).toBe(user.email);
    });

    it('returns tokens without setting cookies if res is omitted', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash });
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.login({ email: user.email, password });
      expect(result.accessToken).toBe('jwt-token');
    });

    it('throws UnauthorizedException for bad credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(
        service.login({ email: 'missing@example.com', password: 'x' }, res),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when user is inactive', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, isActive: false });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.login({ email: user.email, password })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException if doctor is PENDING approval', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, role: Role.DOCTOR });
      usersService.findByEmail.mockResolvedValue(user);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { approvalStatus: 'PENDING' } }),
      });

      await expect(service.login({ email: user.email, password })).rejects.toThrow(
        'admin approves your account',
      );
    });

    it('throws ForbiddenException if doctor is REJECTED', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, role: Role.DOCTOR });
      usersService.findByEmail.mockResolvedValue(user);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ userId: user.id, approvalStatus: 'REJECTED' }],
        });

      await expect(service.login({ email: user.email, password })).rejects.toThrow(
        'rejected by administration',
      );
    });

    it('allows doctor login if approved or upstream check succeeds', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, role: Role.DOCTOR });
      usersService.findByEmail.mockResolvedValue(user);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { approvalStatus: 'APPROVED' } }),
      });

      const res = await service.login({ email: user.email, password });
      expect(res.accessToken).toBe('jwt-token');
    });
  });

  describe('refreshToken', () => {
    it('throws UnauthorizedException if no token is provided', async () => {
      await expect(service.refreshToken({ refreshToken: '' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if token verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException if user not found, inactive, or missing refresh hash', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue(null);

      await expect(service.refreshToken({ refreshToken: 'valid-jwt' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException if bcrypt.compare fails for refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      const hashedRefreshToken = await bcrypt.hash('other-token', 4);
      const user = makeUser({ id: 'user-1', hashedRefreshToken });
      usersService.findById.mockResolvedValue(user);

      await expect(
        service.refreshToken({ refreshToken: 'mismatched-token' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('refreshes token successfully and sets cookies if res passed', async () => {
      const rawToken = 'valid-token';
      const hashedRefreshToken = await bcrypt.hash(rawToken, 4);
      const user = makeUser({ id: 'user-1', hashedRefreshToken });

      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue(user);

      const req = { cookies: { refresh_token: rawToken } } as unknown as Request;
      const res = { cookie: jest.fn() } as unknown as Response;

      const result = await service.refreshToken({}, req, res);

      expect(result.accessToken).toBe('jwt-token');
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('clears the auth cookie when passed a string userId and res', async () => {
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const result = await service.logout('11111111-1111-1111-1111-111111111111', res);

      expect(result).toEqual({ message: 'Successfully logged out' });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        null,
      );
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
    });

    it('handles logout with PublicUser object and no res', async () => {
      const publicUser = usersService.toPublic(makeUser());
      const result = await service.logout(publicUser);

      expect(result).toEqual({ message: 'Successfully logged out' });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(publicUser.id, null);
    });
  });

  describe('updateProfile', () => {
    it('throws NotFoundException if user does not exist', async () => {
      usersService.updateProfile.mockResolvedValue(null);
      await expect(
        service.updateProfile('missing-id', { firstName: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates patient profile successfully', async () => {
      const updated = usersService.toPublic(makeUser({ firstName: 'Updated' }));
      usersService.updateProfile.mockResolvedValue(updated);

      const res = await service.updateProfile('11111111-1111-1111-1111-111111111111', {
        firstName: 'Updated',
      });
      expect(res.firstName).toBe('Updated');
    });

    it('syncs doctor avatar upstream if user is doctor', async () => {
      const doctorUser = usersService.toPublic(makeUser({ role: Role.DOCTOR }));
      usersService.updateProfile.mockResolvedValue(doctorUser);

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { id: 'doc-123' } }),
        })
        .mockResolvedValueOnce({ ok: true });

      const res = await service.updateProfile('11111111-1111-1111-1111-111111111111', {
        avatarUrl: 'http://img.jpg',
      });

      expect(res.role).toBe(Role.DOCTOR);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/doctors/doc-123',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });

  describe('changePassword', () => {
    it('throws NotFoundException if user is not found', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(
        service.changePassword('missing-user', {
          currentPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if current password is wrong', async () => {
      const passwordHash = await bcrypt.hash('correct-old', 4);
      usersService.findById.mockResolvedValue(makeUser({ passwordHash }));

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'wrong-old',
          newPassword: 'new-pass-123',
        }),
      ).rejects.toThrow('Current password is incorrect');
    });

    it('throws BadRequestException if new password equals current password', async () => {
      const passwordHash = await bcrypt.hash('same-pass', 4);
      usersService.findById.mockResolvedValue(makeUser({ passwordHash }));

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'same-pass',
          newPassword: 'same-pass',
        }),
      ).rejects.toThrow('New password must be different');
    });

    it('updates password when input is valid', async () => {
      const passwordHash = await bcrypt.hash('old-pass', 4);
      usersService.findById.mockResolvedValue(makeUser({ passwordHash }));

      const res = await service.changePassword('user-1', {
        currentPassword: 'old-pass',
        newPassword: 'new-pass-456',
      });

      expect(res).toEqual({ message: 'Password updated successfully' });
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
      );
    });
  });
});
