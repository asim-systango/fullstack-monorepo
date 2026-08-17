import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../database/repositories/user.repository';
import { UserStatus } from '../../database/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  AUTH_ERRORS,
  AUTH_MESSAGES,
  AUTH_EXPIRATION,
  JwtTokenType,
} from './constants/auth.constants';

/**
 * Domain-level password management service.
 * Login / Logout / Cookie auth is handled by apps/api-gateway.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  private getResetSecret(): string {
    return process.env.JWT_RESET_SECRET || 'dev-jwt-reset-secret-min-16chars';
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`Forgot password requested for non-existent email: ${dto.email}`);
      return { message: AUTH_MESSAGES.FORGOT_PASSWORD_SENT };
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(AUTH_ERRORS.USER_INACTIVE);
    }

    const resetToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: JwtTokenType.PASSWORD_RESET,
      },
      {
        secret: this.getResetSecret(),
        expiresIn: AUTH_EXPIRATION.PASSWORD_RESET_TOKEN,
      },
    );

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordResetMail({
      toEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`.trim(),
      resetUrl,
    });

    this.logger.log(`Password reset email dispatched to '${user.email}'`);

    return { message: AUTH_MESSAGES.FORGOT_PASSWORD_SENT };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: { sub?: string; email?: string; type?: string };
    try {
      payload = this.jwtService.verify(dto.token, {
        secret: this.getResetSecret(),
      });
    } catch {
      throw new Error(AUTH_ERRORS.INVALID_RESET_TOKEN);
    }

    if (payload.type !== JwtTokenType.PASSWORD_RESET || !payload.sub) {
      throw new Error(AUTH_ERRORS.INVALID_RESET_TOKEN);
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new Error(AUTH_ERRORS.USER_NOT_FOUND);
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new Error(AUTH_ERRORS.SAME_PASSWORD_ERROR);
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.updateUser(user.id, {
      passwordHash: newPasswordHash,
      isPasswordChangeRequired: false,
    });

    this.logger.log(`Password reset successfully completed for user '${user.email}'`);

    return { message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(AUTH_ERRORS.USER_NOT_FOUND);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const isSamePassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new Error(AUTH_ERRORS.SAME_PASSWORD_ERROR);
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.updateUser(user.id, {
      passwordHash: newPasswordHash,
      isPasswordChangeRequired: false,
    });

    this.logger.log(`Password changed successfully for user '${user.email}'`);

    return { message: AUTH_MESSAGES.PASSWORD_CHANGED_SUCCESS };
  }
}
