import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService, type User } from '../users';
import type { Response } from 'express';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  const publicUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    name: 'Demo',
    role: 'user' as const,
  };

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  const usersService = {
    toPublic: jest.fn((user: User) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })),
  };

  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('register returns the created public user', async () => {
    authService.register.mockResolvedValue(publicUser);
    await expect(
      controller.register({
        email: 'user@example.com',
        password: 'password123',
        name: 'Demo',
      }),
    ).resolves.toEqual(publicUser);
  });

  it('register surfaces ConflictException from the service', async () => {
    authService.register.mockRejectedValue(
      new ConflictException('Unable to create account with those details'),
    );
    await expect(
      controller.register({
        email: 'user@example.com',
        password: 'password123',
        name: 'Demo',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login delegates to the service with the response object', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    authService.login.mockResolvedValue(publicUser);

    await expect(
      controller.login({ email: 'user@example.com', password: 'password123' }, res),
    ).resolves.toEqual(publicUser);
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

  it('me returns the public user for the current principal', () => {
    const user = {
      id: publicUser.id,
      email: publicUser.email,
      passwordHash: 'hash',
      name: publicUser.name,
      role: publicUser.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies User;

    expect(controller.me(user)).toEqual(publicUser);
    expect(usersService.toPublic).toHaveBeenCalledWith(user);
  });

  it('logout delegates to the service', () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;
    authService.logout.mockReturnValue({ ok: true });
    expect(controller.logout(res)).toEqual({ ok: true });
    expect(authService.logout).toHaveBeenCalledWith(res);
  });
});
