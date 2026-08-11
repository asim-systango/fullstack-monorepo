import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy (api)', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? 'test-jwt-secret-16' : undefined,
          },
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('maps valid Bearer claims to JwtUser', () => {
    expect(
      strategy.validate({
        sub: '11111111-1111-1111-1111-111111111111',
        email: 'user@example.com',
        role: 'user',
      }),
    ).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'user@example.com',
      role: 'user',
    });
  });

  it('rejects invalid role claims', () => {
    expect(() =>
      strategy.validate({
        sub: '11111111-1111-1111-1111-111111111111',
        email: 'user@example.com',
        role: 'superadmin',
      }),
    ).toThrow(UnauthorizedException);
  });

  it('rejects missing subject', () => {
    expect(() =>
      strategy.validate({
        sub: '',
        email: 'user@example.com',
        role: 'user',
      }),
    ).toThrow(UnauthorizedException);
  });
});
