import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import type { JwtUser, UserRole } from '../../../common/auth';

type JwtPayload = { sub: string; email: string; role: string };

type GatewayUserRow = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
};

const ROLES: readonly UserRole[] = ['admin', 'user', 'staff'];

function isUserRole(value: string): value is UserRole {
  return (ROLES as readonly string[]).includes(value);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    if (!payload.sub || !payload.email || !isUserRole(payload.role)) {
      throw new UnauthorizedException('Invalid token claims');
    }

    // Same physical DB as the gateway `users` table — no local User entity.
    // Re-check is_active so a deactivated account cannot keep calling :3002
    // with a still-valid Bearer token.
    const rows = (await this.dataSource.query(
      `SELECT id, email, role, is_active FROM users WHERE id = $1`,
      [payload.sub],
    )) as GatewayUserRow[];
    const user = rows[0];
    if (!user || user.is_active !== true) {
      throw new UnauthorizedException();
    }
    if (!isUserRole(user.role)) {
      throw new UnauthorizedException('Invalid token claims');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
