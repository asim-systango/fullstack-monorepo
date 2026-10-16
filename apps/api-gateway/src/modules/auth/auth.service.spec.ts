import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService, type User } from '../users';
import type { DomainApiClient } from '../domain-api';
import type { MailerService } from '../mailer';
import type { RefreshTokensService } from './refresh-tokens.service';
import { hashOtp } from './otp.util';
import type { Response } from 'express';

function makeUser(overrides: Partial<User> = {}): User {
  const user: User = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: '',
    name: 'Demo',
    role: 'user',
    emailVerifiedAt: null,
    lastLoginAt: null,
    otpHash: null,
    otpExpiresAt: null,
    otpAttempts: 0,
    otpSentAt: null,
    otpPurpose: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return Object.assign(user, overrides);
}

function mockRes() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;
}

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(async (user: User) => user),
    touchLastLogin: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn(),
    updatePasswordHash: jest.fn(),
    toPublic: jest.fn((user: User) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerifiedAt != null,
    })),
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('jwt-token'),
  };

  const domainApi = {
    getMemberProfile: jest.fn().mockResolvedValue({ status: 'active' }),
    provisionMemberProfile: jest.fn(),
    syncMemberProfile: jest.fn(),
  };

  const mailer = {
    sendOtpEmail: jest.fn().mockResolvedValue(undefined),
  };

  const refreshTokens = {
    issue: jest.fn().mockResolvedValue('refresh-token'),
    findValid: jest.fn(),
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
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
      INTERNAL_SERVICE_TOKEN: 'test-internal-token-16',
      REFRESH_TOKEN_EXPIRES_IN: '30d',
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
    domainApi.getMemberProfile.mockResolvedValue({ status: 'active' });
    domainApi.provisionMemberProfile.mockResolvedValue({ status: 'active' });
    domainApi.syncMemberProfile.mockResolvedValue(undefined);
    refreshTokens.issue.mockResolvedValue('refresh-token');
    refreshTokens.revoke.mockResolvedValue(undefined);
    refreshTokens.revokeAllForUser.mockResolvedValue(undefined);
    jwtService.signAsync.mockResolvedValue('jwt-token');
    usersService.save.mockImplementation(async (user: User) => user);
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      domainApi as unknown as DomainApiClient,
      mailer as unknown as MailerService,
      refreshTokens as unknown as RefreshTokensService,
    );
  });

  describe('register', () => {
    it('creates a user on the happy path', async () => {
      const created = makeUser({ passwordHash: 'hash' });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(created);

      const result = await service.register({
        email: 'user@example.com',
        password: 'password123',
        name: 'Demo',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          name: 'Demo',
          role: 'user',
        }),
      );
      expect(mailer.sendOtpEmail).toHaveBeenCalled();
      expect(result).toEqual({
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
        emailVerified: false,
      });
    });

    it('throws ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'password123',
          name: 'Demo',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('maps Postgres unique violations to ConflictException', async () => {
      usersService.findByEmail.mockResolvedValue(null);
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
          name: 'Demo',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rethrows non-unique create failures', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockRejectedValue(new Error('db down'));

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'password123',
          name: 'Demo',
        }),
      ).rejects.toThrow('db down');
    });
  });

  describe('verifyOtp', () => {
    async function signupUser() {
      return makeUser({
        otpPurpose: 'signup',
        otpHash: await hashOtp('123456'),
        otpExpiresAt: new Date(Date.now() + 60_000),
        otpAttempts: 0,
      });
    }

    it('verifies signup OTP and provisions a member profile', async () => {
      const user = await signupUser();
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.verifyOtp({ email: user.email, otp: '123456' });

      expect(domainApi.provisionMemberProfile).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        fullName: user.name,
      });
      expect(result.emailVerified).toBe(true);
    });

    it('rejects missing or non-signup OTP purpose', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.verifyOtp({ email: 'missing@example.com', otp: '123456' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects expired OTP', async () => {
      const user = await signupUser();
      user.otpExpiresAt = new Date(Date.now() - 1000);
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.verifyOtp({ email: user.email, otp: '123456' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when too many attempts', async () => {
      const user = await signupUser();
      user.otpAttempts = 5;
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.verifyOtp({ email: user.email, otp: '123456' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('increments attempts on a wrong code', async () => {
      const user = await signupUser();
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.verifyOtp({ email: user.email, otp: '000000' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(user.otpAttempts).toBe(1);
      expect(usersService.save).toHaveBeenCalledWith(user);
    });

    it('rejects when OTP fields are missing', async () => {
      const user = makeUser({ otpPurpose: 'signup', otpHash: null, otpExpiresAt: null });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.verifyOtp({ email: user.email, otp: '123456' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('maps provision failure to ServiceUnavailableException', async () => {
      const user = await signupUser();
      usersService.findByEmail.mockResolvedValue(user);
      domainApi.provisionMemberProfile.mockRejectedValue(new Error('down'));

      await expect(
        service.verifyOtp({ email: user.email, otp: '123456' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('resendOtp', () => {
    it('resends signup OTP for an unverified user', async () => {
      const user = makeUser();
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.resendOtp({ email: user.email, purpose: 'signup' }),
      ).resolves.toEqual({ ok: true });
      expect(mailer.sendOtpEmail).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: 'signup' }),
      );
    });

    it('throttles signup resend during cooldown', async () => {
      const user = makeUser({ otpSentAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.resendOtp({ email: user.email }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('skips signup resend when already verified', async () => {
      const user = makeUser({ emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.resendOtp({ email: user.email })).resolves.toEqual({
        ok: true,
      });
      expect(mailer.sendOtpEmail).not.toHaveBeenCalled();
    });

    it('sends password-reset OTP for a verified user', async () => {
      const user = makeUser({ emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.resendOtp({ email: user.email, purpose: 'password_reset' }),
      ).resolves.toEqual({ ok: true });
      expect(mailer.sendOtpEmail).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: 'password_reset' }),
      );
    });

    it('throttles password-reset resend during cooldown', async () => {
      const user = makeUser({
        emailVerifiedAt: new Date(),
        otpSentAt: new Date(),
      });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.resendOtp({ email: user.email, purpose: 'password_reset' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns ok when the email is unknown', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.resendOtp({ email: 'missing@example.com' }),
      ).resolves.toEqual({ ok: true });
    });
  });

  describe('forgotPassword', () => {
    it('sends a reset OTP for a verified user', async () => {
      const user = makeUser({ emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.forgotPassword({ email: user.email })).resolves.toEqual({
        ok: true,
      });
      expect(mailer.sendOtpEmail).toHaveBeenCalledWith(
        expect.objectContaining({ purpose: 'password_reset' }),
      );
    });

    it('silently skips cooldown without leaking the account', async () => {
      const user = makeUser({
        emailVerifiedAt: new Date(),
        otpSentAt: new Date(),
      });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.forgotPassword({ email: user.email })).resolves.toEqual({
        ok: true,
      });
      expect(mailer.sendOtpEmail).not.toHaveBeenCalled();
    });

    it('returns ok for unknown emails', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.forgotPassword({ email: 'missing@example.com' }),
      ).resolves.toEqual({ ok: true });
    });
  });

  describe('resetPassword', () => {
    it('resets the password and revokes refresh tokens', async () => {
      const user = makeUser({
        otpPurpose: 'password_reset',
        otpHash: await hashOtp('654321'),
        otpExpiresAt: new Date(Date.now() + 60_000),
      });
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.resetPassword({
          email: user.email,
          otp: '654321',
          newPassword: 'new-password-123',
        }),
      ).resolves.toEqual({ ok: true });
      expect(refreshTokens.revokeAllForUser).toHaveBeenCalledWith(user.id);
    });

    it('rejects a missing or non-reset OTP', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ otpPurpose: 'signup' }));
      await expect(
        service.resetPassword({
          email: 'user@example.com',
          otp: '000000',
          newPassword: 'new-password-123',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('login', () => {
    it('sets an httpOnly cookie and returns tokens', async () => {
      const password = 'password123';
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 4);
      const user = makeUser({ passwordHash, emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);

      const res = mockRes();
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
      expect(result.accessToken).toBe('jwt-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('throws UnauthorizedException for bad credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const res = mockRes();

      await expect(
        service.login({ email: 'missing@example.com', password: 'x' }, res),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('rejects unverified accounts', async () => {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 4);
      usersService.findByEmail.mockResolvedValue(makeUser({ passwordHash }));

      await expect(
        service.login({ email: 'user@example.com', password: 'password123' }, mockRes()),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('skips member-profile checks for staff', async () => {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 4);
      const user = makeUser({
        passwordHash,
        emailVerifiedAt: new Date(),
        role: 'staff',
      });
      usersService.findByEmail.mockResolvedValue(user);

      await service.login({ email: user.email, password: 'password123' }, mockRes());
      expect(domainApi.getMemberProfile).not.toHaveBeenCalled();
    });

    it('provisions a missing member profile on login', async () => {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 4);
      const user = makeUser({ passwordHash, emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);
      domainApi.getMemberProfile.mockResolvedValue(null);

      await service.login({ email: user.email, password: 'password123' }, mockRes());
      expect(domainApi.provisionMemberProfile).toHaveBeenCalled();
    });

    it('maps provision failure to ServiceUnavailableException', async () => {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 4);
      const user = makeUser({ passwordHash, emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);
      domainApi.getMemberProfile.mockResolvedValue(null);
      domainApi.provisionMemberProfile.mockRejectedValue(new Error('down'));

      await expect(
        service.login({ email: user.email, password: 'password123' }, mockRes()),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('rejects a suspended member', async () => {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 4);
      const user = makeUser({ passwordHash, emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);
      domainApi.getMemberProfile.mockResolvedValue({ status: 'suspended' });

      await expect(
        service.login({ email: user.email, password: 'password123' }, mockRes()),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects a non-active member profile', async () => {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 4);
      const user = makeUser({ passwordHash, emailVerifiedAt: new Date() });
      usersService.findByEmail.mockResolvedValue(user);
      domainApi.getMemberProfile.mockResolvedValue({ status: 'pending' });

      await expect(
        service.login({ email: user.email, password: 'password123' }, mockRes()),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('refresh', () => {
    it('rotates tokens for a valid refresh token', async () => {
      const user = makeUser({ emailVerifiedAt: new Date() });
      refreshTokens.findValid.mockResolvedValue({ userId: user.id });
      usersService.findById.mockResolvedValue(user);

      const result = await service.refresh({ refreshToken: 'old' }, mockRes());
      expect(refreshTokens.revoke).toHaveBeenCalledWith('old');
      expect(result.accessToken).toBe('jwt-token');
    });

    it('rejects an invalid refresh token', async () => {
      refreshTokens.findValid.mockResolvedValue(null);
      await expect(
        service.refresh({ refreshToken: 'bad' }, mockRes()),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('revokes and rejects when the user is missing', async () => {
      refreshTokens.findValid.mockResolvedValue({ userId: 'missing' });
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.refresh({ refreshToken: 'old' }, mockRes()),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(refreshTokens.revoke).toHaveBeenCalledWith('old');
    });
  });

  describe('logout', () => {
    it('clears the auth cookie', () => {
      const res = mockRes();
      expect(service.logout(res)).toEqual({ ok: true });
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
    });

    it('revokes the provided refresh token', () => {
      const res = mockRes();
      expect(service.logout(res, 'refresh-token')).toEqual({ ok: true });
      expect(refreshTokens.revoke).toHaveBeenCalledWith('refresh-token');
    });
  });

  describe('updateMe', () => {
    it('updates profile fields and syncs the member profile', async () => {
      const previous = makeUser({ emailVerifiedAt: new Date() });
      const updated = makeUser({
        email: 'new@example.com',
        name: 'New',
        emailVerifiedAt: new Date(),
      });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findById.mockResolvedValue(previous);
      usersService.updateProfile.mockResolvedValue(updated);

      const result = await service.updateMe(previous.id, {
        email: 'new@example.com',
        name: 'New',
      });

      expect(domainApi.syncMemberProfile).toHaveBeenCalledWith(previous.id, {
        email: 'new@example.com',
        fullName: 'New',
      });
      expect(result.email).toBe('new@example.com');
    });

    it('rejects an empty patch', async () => {
      await expect(service.updateMe('id', {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects email conflicts', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser({ id: 'other' }));
      await expect(
        service.updateMe('id', { email: 'taken@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects a missing user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findById.mockResolvedValue(null);
      await expect(
        service.updateMe('missing', { name: 'X' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('maps unique violations on update', async () => {
      const previous = makeUser();
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findById.mockResolvedValue(previous);
      const driverError = Object.assign(new Error('duplicate key'), { code: '23505' });
      usersService.updateProfile.mockRejectedValue(
        new QueryFailedError('UPDATE', [], driverError),
      );

      await expect(
        service.updateMe(previous.id, { email: 'new@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rethrows non-unique update failures', async () => {
      const previous = makeUser();
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findById.mockResolvedValue(previous);
      usersService.updateProfile.mockRejectedValue(new Error('db down'));

      await expect(
        service.updateMe(previous.id, { name: 'X' }),
      ).rejects.toThrow('db down');
    });

    it('rolls back when member-profile sync fails', async () => {
      const previous = makeUser({ email: 'old@example.com', name: 'Old' });
      const updated = makeUser({ email: 'new@example.com', name: 'New' });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findById.mockResolvedValue(previous);
      usersService.updateProfile.mockResolvedValue(updated);
      domainApi.syncMemberProfile.mockRejectedValue(new Error('down'));

      await expect(
        service.updateMe(previous.id, { email: 'new@example.com', name: 'New' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(usersService.updateProfile).toHaveBeenCalledWith(previous.id, {
        email: previous.email,
        name: previous.name,
      });
    });

    it('skips member-profile sync for staff', async () => {
      const previous = makeUser({ role: 'staff' });
      const updated = makeUser({ role: 'staff', name: 'Staff' });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findById.mockResolvedValue(previous);
      usersService.updateProfile.mockResolvedValue(updated);

      await service.updateMe(previous.id, { name: 'Staff' });
      expect(domainApi.syncMemberProfile).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('updates the password hash', async () => {
      const bcrypt = await import('bcryptjs');
      const user = makeUser({ passwordHash: await bcrypt.hash('old-pass-123', 4) });
      usersService.findById.mockResolvedValue(user);

      await expect(
        service.changePassword(user.id, {
          currentPassword: 'old-pass-123',
          newPassword: 'new-pass-123',
        }),
      ).resolves.toEqual({ ok: true });
      expect(usersService.updatePasswordHash).toHaveBeenCalled();
    });

    it('rejects a missing user', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(
        service.changePassword('missing', {
          currentPassword: 'x',
          newPassword: 'new-pass-123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an incorrect current password', async () => {
      const bcrypt = await import('bcryptjs');
      usersService.findById.mockResolvedValue(
        makeUser({ passwordHash: await bcrypt.hash('old-pass-123', 4) }),
      );

      await expect(
        service.changePassword('id', {
          currentPassword: 'wrong',
          newPassword: 'new-pass-123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
