import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { getAuthCookieOptions } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Login
  async login(dto: LoginDTO, res: Response) {
    const user = await this.usersService.findByEmail(dto.email);

    const hashToCheck =
      user?.password_hash ?? (await bcrypt.hash('dummy-password-for-timing', 12));
    const passwordValid = await bcrypt.compare(dto.password, hashToCheck);

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid email or passoword');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie(
      AUTH_COOKIE_NAME,
      token,
      getAuthCookieOptions(
        process.env.COOKIES_SECURE === 'true',
        7 * 24 * 60 * 60 * 1000,
      ),
    );

    return this.usersService.toPublic(user);
  }

  // Register
  async register(dto: RegisterDTO) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash: passwordHash,
      name: dto.name,
    });

    return this.usersService.toPublic(user);
  }

  logout(res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/',
    });
    return { ok: true };
  }
}
