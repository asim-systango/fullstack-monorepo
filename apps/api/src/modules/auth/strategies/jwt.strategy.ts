import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JwtUser, UserRole } from '../../../common/auth';

type JwtPayload = { sub: string; email: string; role: string };

const ROLES: readonly UserRole[] = ['admin', 'user', 'staff'];

function isUserRole(value: string): value is UserRole {
  return (ROLES as readonly string[]).includes(value);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
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

  validate(payload: JwtPayload): JwtUser {
    if (!payload.sub || !payload.email || !isUserRole(payload.role)) {
      throw new UnauthorizedException('Invalid token claims');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
