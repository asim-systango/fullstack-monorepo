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

export interface SendPasswordResetParams {
  toEmail: string;
  userName: string;
  resetUrl: string;
}

export interface SendNewOnboardingRequestParams {
  toEmail: string;
  contactName: string;
  email: string;
  companyName: string;
  phone?: string;
  companySize?: string;
  industry?: string;
  message?: string;
  dashboardUrl?: string;
}

export interface SendFormStatusUpdatedParams {
  toEmail: string;
  contactName: string;
  companyName: string;
  status: string;
  reviewNotes?: string;
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

  async sendPasswordResetMail(params: SendPasswordResetParams): Promise<void> {
    const { toEmail, userName, resetUrl } = params;
    const from = process.env.MAIL_FROM || '"CRM Platform" <no-reply@crm.com>';
    const subject = 'CRM Account - Password Reset Request';

    const html = this.renderTemplate('password-reset', {
      toEmail,
      userName,
      resetUrl,
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject,
          html,
        });
        this.logger.log(`Password reset email sent successfully to ${toEmail}`);
      } catch (error) {
        this.logger.error(
          `Failed to send password reset email to ${toEmail}: ${(error as Error).message}`,
        );
      }
    } else {
      this.logger.log(
        `[EMAIL SIMULATION] To: ${toEmail} | Subject: ${subject} | ResetUrl: ${resetUrl}`,
      );
    }
  }

  async sendNewOnboardingRequestMail(
    params: SendNewOnboardingRequestParams,
  ): Promise<void> {
    const {
      toEmail,
      contactName,
      email,
      companyName,
      phone = 'N/A',
      companySize = 'N/A',
      industry = 'N/A',
      message,
      dashboardUrl = 'http://localhost:3000/dashboard/onboarding-requests',
    } = params;

    const from = process.env.MAIL_FROM || '"CRM Platform" <no-reply@crm.com>';
    const subject = `[Action Required] New Organization Onboarding Request: ${companyName}`;

    const html = this.renderTemplate('new-onboarding-request', {
      contactName,
      email,
      companyName,
      phone,
      companySize,
      industry,
      message,
      dashboardUrl,
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject,
          html,
        });
        this.logger.log(`New onboarding request notification sent to admin: ${toEmail}`);
      } catch (error) {
        this.logger.error(
          `Failed to send onboarding request email to ${toEmail}: ${(error as Error).message}`,
        );
      }
    } else {
      this.logger.log(
        `[EMAIL SIMULATION] To: ${toEmail} | New Onboarding Request for: ${companyName} (${email})`,
      );
    }
  }

  async sendFormStatusUpdatedMail(params: SendFormStatusUpdatedParams): Promise<void> {
    const { toEmail, contactName, companyName, status, reviewNotes } = params;

    const from = process.env.MAIL_FROM || '"CRM Platform" <no-reply@crm.com>';
    const subject = `[Status Update] Your Onboarding Request for ${companyName} is ${status}`;

    const html = this.renderTemplate('form-status-updated', {
      contactName,
      companyName,
      status,
      reviewNotes,
      isInReview: status === 'IN_REVIEW',
      isApproved: status === 'APPROVED',
      isRejected: status === 'REJECTED',
    });

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject,
          html,
        });
        this.logger.log(
          `Form status update email (${status}) sent to submitter: ${toEmail}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send form status update email to ${toEmail}: ${(error as Error).message}`,
        );
      }
    } else {
      this.logger.log(
        `[EMAIL SIMULATION] To: ${toEmail} | Status updated to ${status} for company ${companyName}`,
      );
    }
  }
}
