import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AUTH_COOKIE } from '../constants/auth.constants';

type JwtPayload = {
  sub: string;
  email: string;
  organizationId?: string;
  role?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret-min-16chars';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req?.cookies as Record<string, string> | undefined;
          return cookies?.[AUTH_COOKIE.NAME] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role || null,
    };
  }
}
