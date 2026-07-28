import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './guards';
import type { ExecutionContext } from '@nestjs/common';

function mockContext(user?: { role: string }) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows when no roles metadata is set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it('allows when user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(guard.canActivate(mockContext({ role: 'admin' }))).toBe(true);
  });

  it('throws UnauthorizedException when user is missing', () => {
    reflector.getAllAndOverride.mockReturnValue(['user']);
    expect(() => guard.canActivate(mockContext())).toThrow(UnauthorizedException);
  });

  it('throws ForbiddenException when role is insufficient', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(mockContext({ role: 'user' }))).toThrow(
      ForbiddenException,
    );
  });
});

describe('JwtAuthGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new JwtAuthGuard(reflector as unknown as Reflector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null for public routes without a user', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(guard.handleRequest(null, null as never, null, mockContext())).toBeNull();
  });

  it('returns the user for public routes when present', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const user = { id: '1' };
    expect(guard.handleRequest(null, user as never, null, mockContext())).toBe(user);
  });

  it('throws when a protected route has no user', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    expect(() => guard.handleRequest(null, null as never, null, mockContext())).toThrow(
      UnauthorizedException,
    );
  });

  it('returns the user for protected routes', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const user = { id: '1', email: 'a@b.c', role: 'user' as const };
    expect(guard.handleRequest(null, user as never, null, mockContext())).toBe(user);
  });

  it('allows public routes when parent JWT activation fails', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const parentProto = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
      canActivate: (context: ExecutionContext) => Promise<boolean>;
    };
    const spy = jest
      .spyOn(parentProto, 'canActivate')
      .mockRejectedValue(new Error('missing token'));

    await expect(guard.canActivate(mockContext())).resolves.toBe(true);
    spy.mockRestore();
  });

  it('defers to parent activation for protected routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const parentProto = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
      canActivate: (context: ExecutionContext) => Promise<boolean>;
    };
    const spy = jest.spyOn(parentProto, 'canActivate').mockResolvedValue(true);

    await expect(guard.canActivate(mockContext())).resolves.toBe(true);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
