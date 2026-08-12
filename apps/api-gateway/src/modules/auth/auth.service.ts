import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { AUTH_COOKIE_NAME, loadGatewayEnv } from '../../common/env';
import { UsersService, type User } from '../users';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { Response } from 'express';

export { AUTH_COOKIE_NAME };

function jwtExpiryToMs(value: string) {
  const trimmed = value.trim();
  const match = /^(\d+)([smhd])?$/.exec(trimmed);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (multipliers[unit] ?? 1000);
}

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class AuthService {
  private readonly env = loadGatewayEnv();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Shared helper — puts JWT in httpOnly cookie after login or register. */
  private async issueSession(user: User, res: Response) {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.env.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      maxAge: jwtExpiryToMs(this.env.JWT_EXPIRES_IN),
    });
  }

  async register(dto: RegisterDto, res: Response) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Unable to create account with those details');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'user',
      });

      // New accounts are signed in right away (same cookie as login).
      await this.issueSession(user, res);
      return this.usersService.toPublic(user);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to create account with those details');
      }
      throw err;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    // Always bcrypt.compare (including missing users) to avoid timing-based email enumeration.
    const hash =
      user?.passwordHash ??
      '$2b$12$N/6IAT14.CPmctktUygdXuFR/ryV4IYaHdV7ilF3IfY2Cpsj/X3q.';
    const ok = await bcrypt.compare(password, hash);
    return user && ok ? user : null;
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    await this.issueSession(user, res);
    return this.usersService.toPublic(user);
  }

  logout(res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: this.env.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
    });
    return { ok: true };
  }

  async saveDeliveryAddress(userId: string, deliveryAddress: string) {
    return this.usersService.saveDeliveryAddress(userId, deliveryAddress);
  }
}
