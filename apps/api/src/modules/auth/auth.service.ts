import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ServiceUnavailableException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { AUTH_COOKIE_NAME, loadApiEnv } from '../../common/env';
import { MailerService } from '../mailer';
import { MembersService } from '../members/members.service';
import { UsersService } from '../users';
import type { User } from '../users';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  UpdateMeDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import {
  OTP_MAX_ATTEMPTS,
  applyIssuedOtp,
  clearOtpFields,
  isOtpCooldownActive,
  verifyOtpHash,
} from './otp.util';
import { RefreshTokensService } from './refresh-tokens.service';
import type { Response } from 'express';
import type { PublicUser } from '../users';

export { AUTH_COOKIE_NAME };

const INVALID_OR_EXPIRED_VERIFICATION_CODE = 'Invalid or expired verification code';

export type AuthTokensResponse = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

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
  private readonly env = loadApiEnv();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly membersService: MembersService,
    private readonly mailer: MailerService,
    private readonly refreshTokens: RefreshTokensService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Unable to create account with those details');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user: User;
    try {
      user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'user',
        emailVerifiedAt: null,
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to create account with those details');
      }
      throw err;
    }

    const { user: withOtp, otp } = await applyIssuedOtp(user, 'signup');
    await this.usersService.save(withOtp);
    await this.mailer.sendOtpEmail({
      to: withOtp.email,
      otp,
      purpose: 'signup',
    });

    return this.usersService.toPublic(withOtp);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.otpPurpose !== 'signup') {
      throw new BadRequestException(INVALID_OR_EXPIRED_VERIFICATION_CODE);
    }

    await this.assertOtpValid(user, dto.otp);

    user.emailVerifiedAt = new Date();
    clearOtpFields(user);
    await this.usersService.save(user);

    try {
      await this.membersService.provision({
        userId: user.id,
        email: user.email,
        fullName: user.name,
      });
    } catch {
      throw new ServiceUnavailableException(
        'Account verified, but library profile setup is temporarily unavailable. Please try logging in shortly.',
      );
    }

    return this.usersService.toPublic(user);
  }

  async resendOtp(dto: ResendOtpDto) {
    const purpose = dto.purpose ?? 'signup';
    const user = await this.usersService.findByEmail(dto.email);

    if (user) {
      if (purpose === 'signup') {
        if (!user.emailVerifiedAt) {
          if (isOtpCooldownActive(user)) {
            throw new BadRequestException('Please wait before requesting another code');
          }
          const { user: withOtp, otp } = await applyIssuedOtp(user, 'signup');
          await this.usersService.save(withOtp);
          await this.mailer.sendOtpEmail({
            to: withOtp.email,
            otp,
            purpose: 'signup',
          });
        }
      } else if (user.emailVerifiedAt) {
        if (isOtpCooldownActive(user)) {
          throw new BadRequestException('Please wait before requesting another code');
        }
        const { user: withOtp, otp } = await applyIssuedOtp(user, 'password_reset');
        await this.usersService.save(withOtp);
        await this.mailer.sendOtpEmail({
          to: withOtp.email,
          otp,
          purpose: 'password_reset',
        });
      }
    }

    return { ok: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user?.emailVerifiedAt) {
      if (isOtpCooldownActive(user)) {
        // Still generic ok to avoid leaking cooldown vs missing user — but plan allows cooldown errors on resend.
        // For forgot, prefer generic ok always except we can still enforce cooldown silently by not sending.
        // Plan: cooldown/throttle same as resend. Throwing BadRequest leaks that email exists if only verified users get cooldown.
        // Use silent skip on cooldown for enumeration safety.
      } else {
        const { user: withOtp, otp } = await applyIssuedOtp(user, 'password_reset');
        await this.usersService.save(withOtp);
        await this.mailer.sendOtpEmail({
          to: withOtp.email,
          otp,
          purpose: 'password_reset',
        });
      }
    }
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.otpPurpose !== 'password_reset') {
      throw new BadRequestException('Invalid or expired reset code');
    }

    await this.assertOtpValid(user, dto.otp);

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.mustChangePassword = false;
    clearOtpFields(user);
    await this.usersService.save(user);
    await this.refreshTokens.revokeAllForUser(user.id);

    return { ok: true };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const hash =
      user?.passwordHash ??
      '$2b$12$N/6IAT14.CPmctktUygdXuFR/ryV4IYaHdV7ilF3IfY2Cpsj/X3q.';
    const ok = await bcrypt.compare(password, hash);
    return user && ok ? user : null;
  }

  async login(dto: LoginDto, res: Response): Promise<AuthTokensResponse> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Email not verified');
    }

    if (user.role === 'user') {
      await this.ensureActiveMemberProfile(user);
    }

    return this.issueSession(user, res);
  }

  async refresh(dto: RefreshTokenDto, res: Response): Promise<AuthTokensResponse> {
    const existing = await this.refreshTokens.findValid(dto.refreshToken);
    if (!existing) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(existing.userId);
    if (!user || !user.emailVerifiedAt) {
      await this.refreshTokens.revoke(dto.refreshToken);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (user.role === 'user') {
      await this.ensureActiveMemberProfile(user);
    }

    await this.refreshTokens.revoke(dto.refreshToken);
    return this.issueSession(user, res);
  }

  logout(res: Response, refreshToken?: string) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: this.env.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
    });
    if (refreshToken) {
      void this.refreshTokens.revoke(refreshToken);
    }
    return { ok: true };
  }

  private async issueSession(user: User, res: Response): Promise<AuthTokensResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.refreshTokens.issue(
      user.id,
      jwtExpiryToMs(this.env.REFRESH_TOKEN_EXPIRES_IN),
    );

    res.cookie(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: this.env.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      maxAge: jwtExpiryToMs(this.env.JWT_EXPIRES_IN),
    });

    await this.usersService.touchLastLogin(user.id);

    return {
      user: this.usersService.toPublic(user),
      accessToken,
      refreshToken,
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    if (dto.email === undefined && dto.name === undefined) {
      throw new BadRequestException('No fields to update');
    }

    if (dto.email) {
      const other = await this.usersService.findByEmail(dto.email);
      if (other && other.id !== userId) {
        throw new ConflictException('Unable to update account with those details');
      }
    }

    const previous = await this.usersService.findById(userId);
    if (!previous) throw new UnauthorizedException();

    let updated: User;
    try {
      updated = await this.usersService.updateProfile(userId, {
        email: dto.email,
        name: dto.name,
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to update account with those details');
      }
      throw err;
    }

    if (updated.role === 'user') {
      try {
        await this.membersService.syncMirrors(userId, {
          email: updated.email,
          fullName: updated.name,
        });
      } catch {
        await this.usersService.updateProfile(userId, {
          email: previous.email,
          name: previous.name,
        });
        throw new ServiceUnavailableException(
          'Profile update is temporarily unavailable. Please try again.',
        );
      }
    }

    return this.usersService.toPublic(updated);
  }

  async changePassword(userId: string, dto: ChangePasswordDto, res: Response) {
    const user = await this.requireCurrentPassword(userId, dto.currentPassword);

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.mustChangePassword = false;
    await this.usersService.save(user);
    await this.refreshTokens.revokeAllForUser(userId);
    return this.logout(res);
  }

  private async requireCurrentPassword(userId: string, currentPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    return user;
  }

  /**
   * role=user must have an active member_profile before any session cookie.
   * Missing → one catch-up provision; failure → 503 (no cookie).
   */
  private async ensureActiveMemberProfile(user: User): Promise<void> {
    let profile = await this.membersService.findByUserId(user.id);

    if (!profile) {
      try {
        profile = await this.membersService.provision({
          userId: user.id,
          email: user.email,
          fullName: user.name,
        });
      } catch {
        throw new ServiceUnavailableException(
          'Library profile setup is temporarily unavailable. Please try again.',
        );
      }
    }

    if (profile.status === 'suspended') {
      throw new ForbiddenException('Account is suspended');
    }

    if (profile.status !== 'active') {
      throw new ServiceUnavailableException(
        'Library profile setup is temporarily unavailable. Please try again.',
      );
    }
  }

  private async assertOtpValid(user: User, otp: string): Promise<void> {
    if (!user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestException(INVALID_OR_EXPIRED_VERIFICATION_CODE);
    }
    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many attempts. Please request a new verification code.',
      );
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException(INVALID_OR_EXPIRED_VERIFICATION_CODE);
    }

    const ok = await verifyOtpHash(otp, user.otpHash);
    if (!ok) {
      user.otpAttempts += 1;
      await this.usersService.save(user);
      throw new BadRequestException(INVALID_OR_EXPIRED_VERIFICATION_CODE);
    }
  }
}
