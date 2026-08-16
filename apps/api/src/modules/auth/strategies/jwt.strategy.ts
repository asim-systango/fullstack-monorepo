import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../../database/repositories/user.repository';
import { UserStatus } from '../../../database/entities/user.entity';
import { JwtTokenType } from '../constants/auth.constants';

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId?: string | null;
  roleId?: string;
  type?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-jwt-secret-min-16chars',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === JwtTokenType.PASSWORD_RESET) {
      throw new UnauthorizedException(
        'Password reset token cannot be used for API authentication',
      );
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING)) {
      throw new UnauthorizedException('User is inactive or token is invalid');
    }

    if (user.isPasswordChangeRequired) {
      throw new ForbiddenException(
        'Password change is required before accessing API endpoints',
      );
    }

    return user;
  }
}
