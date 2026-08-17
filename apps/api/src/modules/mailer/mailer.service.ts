import { randomUUID } from 'node:crypto';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { loadApiEnv } from '../../common/env';
import { ONBOARDING_EMAIL_UNAVAILABLE } from './onboarding-mail.constants';
import { buildLibraryEmail, type LibraryEmailInput } from './templates/library-email';
import {
  buildOnboardingEmail,
  type OnboardingEmailKind,
} from './templates/onboarding-email';
import { buildOtpEmail } from './templates/otp-email';

export type LibraryMailResult = 'sent' | 'skipped' | 'failed';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly env = loadApiEnv();

  async sendOtpEmail(input: {
    to: string;
    otp: string;
    purpose: 'signup' | 'password_reset';
  }): Promise<void> {
    const { subject, text, html } = buildOtpEmail({
      otp: input.otp,
      purpose: input.purpose,
    });

    if (!this.env.SMTP_HOST) {
      this.logger.log(
        `[dev mailer] to=${input.to} purpose=${input.purpose} otp=${input.otp}`,
      );
      return;
    }

    try {
      await this.sendMail({ to: input.to, subject, text, html });
    } catch (err) {
      this.logger.error(
        `SMTP send failed; falling back to console log: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      this.logger.log(
        `[dev mailer fallback] to=${input.to} purpose=${input.purpose} otp=${input.otp}`,
      );
    }
  }

  /**
   * Sends admin-created / staff-upgrade credentials.
   * Never logs the temporary password. Throws if SMTP is missing or send fails.
   */
  async sendOnboardingEmail(input: {
    to: string;
    kind: OnboardingEmailKind;
    temporaryPassword: string;
  }): Promise<void> {
    if (!this.env.SMTP_HOST) {
      this.logger.error('Onboarding email skipped: SMTP_HOST is not configured');
      throw new ServiceUnavailableException(ONBOARDING_EMAIL_UNAVAILABLE);
    }

    const { subject, text, html } = buildOnboardingEmail({
      kind: input.kind,
      email: input.to,
      temporaryPassword: input.temporaryPassword,
    });

    try {
      await this.sendMail({ to: input.to, subject, text, html });
    } catch (err) {
      this.logger.error(
        `Onboarding email failed for ${input.to}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      throw new ServiceUnavailableException(ONBOARDING_EMAIL_UNAVAILABLE);
    }
  }

  /**
   * Library notices never throw. Missing SMTP logs the body (like OTP) so local
   * checkout still has a visible confirmation. Send errors fall back the same way.
   */
  async sendLibraryEmail(
    to: string,
    input: LibraryEmailInput,
  ): Promise<LibraryMailResult> {
    const { subject, text, html } = buildLibraryEmail(input);
    if (!this.env.SMTP_HOST) {
      this.logger.log(
        `[library mailer] skipped SMTP kind=${input.kind} to=${to} subject=${subject}\n${text}`,
      );
      return 'skipped';
    }
    try {
      await this.sendMail({ to, subject, text, html });
      this.logger.log(`[library mailer] sent kind=${input.kind} to=${to}`);
      return 'sent';
    } catch (err) {
      this.logger.error(
        `Library email failed kind=${input.kind} to=${to}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      this.logger.log(
        `[library mailer fallback] kind=${input.kind} to=${to} subject=${subject}\n${text}`,
      );
      return 'failed';
    }
  }

  private async sendMail(input: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    await this.createTransport().sendMail({
      from: this.fromAddress(),
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      messageId: `<${randomUUID()}@bookly.local>`,
    });
  }

  private fromAddress(): string {
    const raw = this.env.SMTP_FROM ?? this.env.SMTP_USER ?? 'noreply@bookly.local';
    return raw.replace(/^["']|["']$/g, '').trim();
  }

  private createTransport(): Transporter {
    return nodemailer.createTransport({
      host: this.env.SMTP_HOST,
      port: this.env.SMTP_PORT ?? 587,
      secure: (this.env.SMTP_PORT ?? 587) === 465,
      auth:
        this.env.SMTP_USER && this.env.SMTP_PASS
          ? { user: this.env.SMTP_USER, pass: this.env.SMTP_PASS }
          : undefined,
    });
  }
}
