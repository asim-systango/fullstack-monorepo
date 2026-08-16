import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { JwtStrategy } from './jwt.strategy';

const USER_ID = '11111111-1111-1111-1111-111111111111';

describe('JwtStrategy (api)', () => {
  let strategy: JwtStrategy;
  const query = jest.fn();

  beforeEach(async () => {
    query.mockReset();
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
        {
          provide: DataSource,
          useValue: { query },
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('maps an active user row to JwtUser', async () => {
    query.mockResolvedValue([
      {
        id: USER_ID,
        email: 'user@example.com',
        role: 'user',
        is_active: true,
      },
    ]);

    await expect(
      strategy.validate({
        sub: USER_ID,
        email: 'stale@example.com',
        role: 'user',
      }),
    ).resolves.toEqual({
      id: USER_ID,
      email: 'user@example.com',
      role: 'user',
    });
    expect(query).toHaveBeenCalledWith(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [USER_ID],
    );
  });

  it('rejects invalid role claims without querying users', async () => {
    await expect(
      strategy.validate({
        sub: USER_ID,
        email: 'user@example.com',
        role: 'superadmin',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects missing subject without querying users', async () => {
    await expect(
      strategy.validate({
        sub: '',
        email: 'user@example.com',
        role: 'user',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(query).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when the subject is deactivated', async () => {
    query.mockResolvedValue([
      {
        id: USER_ID,
        email: 'user@example.com',
        role: 'user',
        is_active: false,
      },
    ]);

    await expect(
      strategy.validate({
        sub: USER_ID,
        email: 'user@example.com',
        role: 'user',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when the subject is missing', async () => {
    query.mockResolvedValue([]);

    await expect(
      strategy.validate({
        sub: USER_ID,
        email: 'user@example.com',
        role: 'user',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
