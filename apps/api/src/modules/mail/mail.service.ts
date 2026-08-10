import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface SendOrgAdminInviteParams {
  toEmail: string;
  adminName: string;
  organizationName: string;
  tempPassword: string;
  loginUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`MailService initialized with SMTP host: ${host}`);
    } else {
      this.logger.warn(
        'SMTP credentials not configured. Emails will be logged to console.',
      );
    }
  }

  private renderTemplate(templateName: string, context: Record<string, unknown>): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    if (!fs.existsSync(templatePath)) {
      // Fallback path in case ts-node / dist directory is structured differently
      const altPath = path.join(
        process.cwd(),
        'src/modules/mail/templates',
        `${templateName}.hbs`,
      );
      if (fs.existsSync(altPath)) {
        const source = fs.readFileSync(altPath, 'utf8');
        return handlebars.compile(source)(context);
      }
      throw new Error(`Email template file not found at ${templatePath}`);
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(source)(context);
  }

  async sendOrgAdminInvitationMail(params: SendOrgAdminInviteParams): Promise<void> {
    const {
      toEmail,
      adminName,
      organizationName,
      tempPassword,
      loginUrl = 'http://localhost:3000/login',
    } = params;
    const from = process.env.MAIL_FROM || '"CRM Platform" <no-reply@crm.com>';
    const subject = `Welcome to CRM - Onboarding Invitation for ${organizationName}`;

    const html = this.renderTemplate('org-admin-invite', {
      toEmail,
      adminName,
      organizationName,
      tempPassword,
      loginUrl,
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject,
          html,
        });
        this.logger.log(`Invitation email sent successfully to ${toEmail}`);
      } catch (error) {
        this.logger.error(
          `Failed to send invitation email to ${toEmail}: ${(error as Error).message}`,
        );
      }
    } else {
      this.logger.log(
        `[EMAIL SIMULATION] To: ${toEmail} | Subject: ${subject} | TempPassword: ${tempPassword}`,
      );
    }
  }
}
