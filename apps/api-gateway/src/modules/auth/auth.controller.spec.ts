import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  const publicUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    name: 'Demo',
    role: 'user' as const,
    deliveryAddress: null,
  };

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    saveDeliveryAddress: jest.fn(),
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

  it('register returns the created public user and passes response', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    authService.register.mockResolvedValue(publicUser);
    await expect(
      controller.register(
        {
          email: 'user@example.com',
          password: 'password123',
          name: 'Demo',
        },
        res,
      ),
    ).resolves.toEqual(publicUser);
    expect(authService.register).toHaveBeenCalledWith(
      {
        email: 'user@example.com',
        password: 'password123',
        name: 'Demo',
      },
      res,
    );
  });

  it('register surfaces ConflictException from the service', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;
    authService.register.mockRejectedValue(
      new ConflictException('Unable to create account with those details'),
    );
    await expect(
      controller.register(
        {
          email: 'user@example.com',
          password: 'password123',
          name: 'Demo',
        },
        res,
      ),
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

  it('me returns the current public user principal', () => {
    expect(controller.me(publicUser)).toEqual(publicUser);
  });

  it('logout delegates to the service', () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;
    authService.logout.mockReturnValue({ ok: true });
    expect(controller.logout(res)).toEqual({ ok: true });
    expect(authService.logout).toHaveBeenCalledWith(res);
  });

  it('saveAddress delegates to the service', async () => {
    const updated = { ...publicUser, deliveryAddress: '21 MG Road, Indore' };
    authService.saveDeliveryAddress.mockResolvedValue(updated);

    await expect(
      controller.saveAddress(publicUser, { deliveryAddress: '21 MG Road, Indore' }),
    ).resolves.toEqual(updated);
    expect(authService.saveDeliveryAddress).toHaveBeenCalledWith(
      publicUser.id,
      '21 MG Road, Indore',
    );
  });
});
