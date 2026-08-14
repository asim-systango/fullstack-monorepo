import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { IsNull, Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { AUTH_COOKIE_NAME, loadApiEnv, parseDurationToMs } from '../../common/env';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users';
import { EmailVerificationToken } from './email-verification-token.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { generateRawToken, hashToken } from './token.util';

export { AUTH_COOKIE_NAME };

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
    private readonly mailService: MailService,
    @InjectRepository(EmailVerificationToken)
    private readonly verificationTokens: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Unable to create account with those details');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user;
    try {
      user = await this.usersService.create({
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'user',
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Unable to create account with those details');
      }
      throw err;
    }

    await this.issueVerificationToken(user.id, user.email, user.name);
    return this.usersService.toPublic(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = hashToken(dto.token);
    const record = await this.verificationTokens.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.verificationTokens.update(record.id, { usedAt: new Date() });
    const user = await this.usersService.markEmailVerified(record.userId);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    return this.usersService.toPublic(user);
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user && !user.emailVerifiedAt) {
      await this.issueVerificationToken(user.id, user.email, user.name);
    }

    return {
      message: 'If that email is registered and unverified, we sent a verification link',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      await this.issuePasswordResetToken(user.id, user.email, user.name);
    }

    return {
      message: 'If that email exists, we sent a password reset link',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token);
    const record = await this.resetTokens.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.usersService.updatePassword(record.userId, passwordHash);
    await this.resetTokens.update(record.id, { usedAt: new Date() });

    const user = await this.usersService.findById(record.userId);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return this.usersService.toPublic(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const hash =
      user?.passwordHash ??
      '$2b$12$N/6IAT14.CPmctktUygdXuFR/ryV4IYaHdV7ilF3IfY2Cpsj/X3q.';
    const ok = await bcrypt.compare(password, hash);
    return user && ok ? user : null;
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Please verify your email');
    }

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
      maxAge: parseDurationToMs(this.env.JWT_EXPIRES_IN),
    });

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

  private async issueVerificationToken(userId: string, email: string, name: string) {
    await this.verificationTokens.update(
      { userId, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    const raw = generateRawToken();
    const expiresAt = new Date(
      Date.now() + parseDurationToMs(this.env.EMAIL_VERIFICATION_EXPIRES_IN),
    );

    await this.verificationTokens.save(
      this.verificationTokens.create({
        userId,
        tokenHash: hashToken(raw),
        expiresAt,
      }),
    );

    await this.mailService.sendVerificationEmail(email, raw, name);
  }

  private async issuePasswordResetToken(userId: string, email: string, name: string) {
    await this.resetTokens.update({ userId, usedAt: IsNull() }, { usedAt: new Date() });

    const raw = generateRawToken();
    const expiresAt = new Date(
      Date.now() + parseDurationToMs(this.env.PASSWORD_RESET_EXPIRES_IN),
    );

    await this.resetTokens.save(
      this.resetTokens.create({
        userId,
        tokenHash: hashToken(raw),
        expiresAt,
      }),
    );

    await this.mailService.sendPasswordResetEmail(email, raw, name);
  }
}
