import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { loadGatewayEnv } from '../../common/env';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly env = loadGatewayEnv();

  async sendOtpEmail(input: {
    to: string;
    otp: string;
    purpose: 'signup' | 'password_reset';
  }): Promise<void> {
    const subject =
      input.purpose === 'signup'
        ? 'BOOKLY — verify your email'
        : 'BOOKLY — password reset code';
    const body =
      input.purpose === 'signup'
        ? `Your BOOKLY verification code is ${input.otp}. It expires in 10 minutes.`
        : `Your BOOKLY password reset code is ${input.otp}. It expires in 10 minutes.`;

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
        text: body,
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
