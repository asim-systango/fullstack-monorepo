import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { AUTH_COOKIE_NAME, loadGatewayEnv } from '../../common/env';
import { Role } from '../users/user.entity';
import { UsersService, type PublicUser } from '../users';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import type { Response, Request } from 'express';

export { AUTH_COOKIE_NAME };

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

export const REFRESH_COOKIE_NAME = 'refresh_token';

@Injectable()
export class AuthService {
  private readonly env = loadGatewayEnv();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    if (dto.phone) {
      const existingPhone = await this.usersService.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        name: `${dto.firstName} ${dto.lastName}`.trim(),
        phone: dto.phone,
        role: Role.PATIENT,
      });

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.usersService.toPublic(user),
      };
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('User with specified email or phone already exists');
      }
      throw err;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    // Always bcrypt.compare (including missing users) to prevent timing attacks.
    const hash =
      user?.passwordHash ??
      '$2b$12$N/6IAT14.CPmctktUygdXuFR/ryV4IYaHdV7ilF3IfY2Cpsj/X3q.';
    const ok = await bcrypt.compare(password, hash);
    return user && ok ? user : null;
  }

  async login(dto: LoginDto, res?: Response) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (!user.isActive) {
      throw new ForbiddenException('User account is deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    if (res) {
      res.cookie(AUTH_COOKIE_NAME, tokens.accessToken, {
        httpOnly: true,
        secure: this.env.COOKIE_SECURE,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15m
      });

      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        secure: this.env.COOKIE_SECURE,
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.usersService.toPublic(user),
    };
  }

  async refreshToken(dto: RefreshTokenDto, req?: Request, res?: Response) {
    const refreshToken =
      dto?.refreshToken || (req?.cookies ? req.cookies[REFRESH_COOKIE_NAME] : null);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: string;
      }>(refreshToken, {
        secret: this.env.JWT_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.hashedRefreshToken || !user.isActive) {
        throw new ForbiddenException('Access Denied');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
      if (!isMatch) {
        throw new ForbiddenException('Access Denied');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      if (res) {
        res.cookie(AUTH_COOKIE_NAME, tokens.accessToken, {
          httpOnly: true,
          secure: this.env.COOKIE_SECURE,
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60 * 1000,
        });

        res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
          httpOnly: true,
          secure: this.env.COOKIE_SECURE,
          sameSite: 'lax',
          path: '/auth/refresh',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.usersService.toPublic(user),
      };
    } catch (err: unknown) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userOrId: string | PublicUser, res?: Response) {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
    if (userId) {
      await this.usersService.updateRefreshToken(userId, null);
    }

    if (res) {
      res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: this.env.COOKIE_SECURE,
        sameSite: 'lax',
        path: '/',
      });
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: this.env.COOKIE_SECURE,
        sameSite: 'lax',
        path: '/auth/refresh',
      });
    }

    return { message: 'Successfully logged out' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { expiresIn: '15m', secret: this.env.JWT_SECRET },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { expiresIn: '7d', secret: this.env.JWT_SECRET },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
