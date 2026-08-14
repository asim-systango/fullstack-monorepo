import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../../database/entities/user.entity';
import {
  Organization,
  OrganizationStatus,
} from '../../database/entities/organization.entity';
import { LoginDto } from './dto/login.dto';
import {
  AUTH_ERRORS,
  AUTH_MESSAGES,
  AUTH_COOKIE,
  TokenType,
  JwtTokenType,
} from './constants/auth.constants';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, res: Response) {
    // 1. Find user by email (with org slug filter if provided)
    let user: User | null = null;

    if (dto.organizationSlug) {
      user = await this.userRepository.findOne({
        where: {
          email: dto.email.toLowerCase(),
          organization: { slug: dto.organizationSlug },
        },
        relations: ['role', 'organization'],
      });
    }

    if (!user) {
      user = await this.userRepository.findOne({
        where: { email: dto.email.toLowerCase() },
        relations: ['role', 'organization'],
      });
    }

    // 2. Validate user exists
    if (!user) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // 3. Validate user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(AUTH_ERRORS.USER_INACTIVE);
    }

    // 4. Validate password via bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // 5. Validate organization context
    let organizationContext: {
      id: string;
      name: string;
      slug: string;
      primaryDomain: string;
      logoUrl?: string;
    } | null = null;

    if (user.organizationId) {
      const org = await this.orgRepository.findOne({
        where: { id: user.organizationId },
      });

      if (!org || org.status !== OrganizationStatus.ACTIVE) {
        throw new Error(AUTH_ERRORS.ORGANIZATION_INACTIVE);
      }

      if (dto.organizationSlug && org.slug !== dto.organizationSlug) {
        throw new Error(AUTH_ERRORS.ORGANIZATION_MISMATCH);
      }

      organizationContext = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        primaryDomain: org.primaryDomain,
        logoUrl: org.logoUrl,
      };
    }

    const roleName = user.role?.name || null;

    // 6. If password change is required, issue scoped Password Reset Token
    if (user.isPasswordChangeRequired) {
      const passwordResetToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          type: JwtTokenType.PASSWORD_RESET,
        },
        {
          secret: process.env.JWT_RESET_SECRET || 'dev-jwt-reset-secret-min-16chars',
          expiresIn: '15m',
        },
      );

      this.logger.log(
        `User '${user.email}' requires password reset. Password reset token issued.`,
      );

      return {
        accessToken: null,
        passwordResetToken,
        isPasswordChangeRequired: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: roleName,
          isPasswordChangeRequired: true,
        },
        organization: organizationContext,
        message: AUTH_MESSAGES.PASSWORD_CHANGE_REQUIRED_LOGIN,
      };
    }

    // 7. Update last login timestamp
    await this.userRepository.update(user.id, { lastLoginAt: Date.now() });

    // 8. Generate JWT access token
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: roleName,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    // 9. Set httpOnly cookie on browser response
    res.cookie(AUTH_COOKIE.NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_COOKIE.MAX_AGE_MS,
    });

    this.logger.log(`User '${user.email}' (${roleName}) logged in successfully`);

    return {
      accessToken,
      tokenType: TokenType.BEARER,
      expiresIn: process.env.JWT_EXPIRY || '7d',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleName,
        isPasswordChangeRequired: false,
        lastLoginAt: Date.now(),
      },
      organization: organizationContext,
    };
  }

  logout(res: Response) {
    res.clearCookie(AUTH_COOKIE.NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    this.logger.log('User logged out, access_token cookie cleared');

    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }
}
