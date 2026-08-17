import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { PublicUser } from '../users';

describe('AuthController', () => {
  const publicUser: PublicUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    firstName: 'Demo',
    lastName: 'User',
    name: 'Demo User',
    phone: '+1234567890',
    role: 'PATIENT' as const,
    isActive: true,
    emailVerified: true,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
  };

  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('register returns the created public user', async () => {
    authService.register.mockResolvedValue({ user: publicUser });
    await expect(
      controller.register({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'User',
      }),
    ).resolves.toEqual({ user: publicUser });
  });

  it('register surfaces ConflictException from the service', async () => {
    authService.register.mockRejectedValue(
      new ConflictException('Unable to create account with those details'),
    );
    await expect(
      controller.register({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login delegates to the service with the response object', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    authService.login.mockResolvedValue({ user: publicUser });

    await expect(
      controller.login({ email: 'user@example.com', password: 'password123' }, res),
    ).resolves.toEqual({ user: publicUser });
    expect(authService.login).toHaveBeenCalledWith(
      { email: 'user@example.com', password: 'password123' },
      res,
    );
  });

  it('login surfaces UnauthorizedException from the service', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    authService.login.mockRejectedValue(
      new UnauthorizedException('Invalid email or password'),
    );

    await expect(
      controller.login({ email: 'user@example.com', password: 'wrong' }, res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('me returns the current public user principal', () => {
    expect(controller.me(publicUser)).toEqual(publicUser);
  });

  it('logout delegates to the service', async () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;
    authService.logout.mockResolvedValue({ message: 'Successfully logged out' });
    await expect(controller.logout(publicUser, res)).resolves.toEqual({
      message: 'Successfully logged out',
    });
    expect(authService.logout).toHaveBeenCalledWith(publicUser, res);
  });

  it('changePassword delegates to the service', async () => {
    authService.changePassword.mockResolvedValue({
      message: 'Password updated successfully',
    });
    await expect(
      controller.changePassword(publicUser, {
        currentPassword: 'OldPassword1!',
        newPassword: 'NewPassword1!',
      }),
    ).resolves.toEqual({ message: 'Password updated successfully' });
    expect(authService.changePassword).toHaveBeenCalledWith(publicUser.id, {
      currentPassword: 'OldPassword1!',
      newPassword: 'NewPassword1!',
    });
  });
});
