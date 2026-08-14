import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { loadApiEnv } from '@shared/env/api';
import {
  buildGroupInviteEmail,
  buildPasswordResetEmail,
  buildVerificationEmail,
} from './templates/email-templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly appPublicUrl: string;

  constructor() {
    const env = loadApiEnv();
    this.from = env.SMTP_FROM;
    this.appPublicUrl = env.APP_PUBLIC_URL;
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      requireTLS: env.SMTP_REQUIRE_TLS,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
  }

  async sendVerificationEmail(to: string, token: string, name?: string): Promise<void> {
    const content = buildVerificationEmail(this.appPublicUrl, token, name);
    await this.send(to, content.subject, content.text, content.html);
  }

  async sendPasswordResetEmail(to: string, token: string, name?: string): Promise<void> {
    const content = buildPasswordResetEmail(this.appPublicUrl, token, name);
    await this.send(to, content.subject, content.text, content.html);
  }

  async sendGroupInviteEmail(
    to: string,
    token: string,
    groupName: string,
    inviterName: string,
  ): Promise<void> {
    const content = buildGroupInviteEmail(
      this.appPublicUrl,
      token,
      groupName,
      inviterName,
    );
    await this.send(to, content.subject, content.text, content.html);
  }

  private async send(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html,
      });
    } catch (err) {
      this.logger.error('SMTP send failed', err instanceof Error ? err.stack : err);
      throw new ServiceUnavailableException('Unable to send email — try again later');
    }
  }
}
