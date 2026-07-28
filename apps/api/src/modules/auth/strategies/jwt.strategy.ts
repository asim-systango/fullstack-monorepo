import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loadApiEnv } from '../../../common/env';
import type { JwtUser, UserRole } from '../../../common/auth';

type JwtPayload = { sub: string; email: string; role: string };

const ROLES: readonly UserRole[] = ['admin', 'user', 'staff'];

function isUserRole(value: string): value is UserRole {
  return (ROLES as readonly string[]).includes(value);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const env = loadApiEnv();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
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
