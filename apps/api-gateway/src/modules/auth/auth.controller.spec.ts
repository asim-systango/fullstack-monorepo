import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  const publicUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    name: 'Demo',
    role: 'user' as const,
  };

  const authService = {
    login: jest.fn(),
    logout: jest.fn(),
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

  it('login surfaces UnauthorizedException from the service errors', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    authService.login.mockRejectedValue(
      new Error('INVALID_CREDENTIALS'),
    );

    await expect(
      controller.login({ email: 'user@example.com', password: 'wrong' }, res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('me returns the current public user principal', () => {
    const authPrincipal = {
      sub: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
    };
    expect(controller.me(authPrincipal)).toEqual(authPrincipal);
  });

  it('logout delegates to the service', () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;
    authService.logout.mockReturnValue({ message: 'LOGOUT_SUCCESS' });
    expect(controller.logout(res)).toEqual({ message: 'LOGOUT_SUCCESS' });
    expect(authService.logout).toHaveBeenCalledWith(res);
  });
});
