import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { loadApiEnv } from '../../common/env';
import { buildOtpEmail } from './templates/otp-email';

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
      const transporter = nodemailer.createTransport({
        host: this.env.SMTP_HOST,
        port: this.env.SMTP_PORT ?? 587,
        secure: (this.env.SMTP_PORT ?? 587) === 465,
        auth:
          this.env.SMTP_USER && this.env.SMTP_PASS
            ? { user: this.env.SMTP_USER, pass: this.env.SMTP_PASS }
            : undefined,
      });
      await transporter.sendMail({
        from: this.env.SMTP_FROM ?? this.env.SMTP_USER ?? 'noreply@bookly.local',
        to: input.to,
        subject,
        text,
        html,
      });
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
}
