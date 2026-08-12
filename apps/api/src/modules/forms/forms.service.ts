import { Injectable, Logger } from '@nestjs/common';
import { FormSubmissionRepository } from '../../database/repositories/form-submission.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import {
  FormType,
  FormSubmissionStatus,
} from '../../database/entities/form-submission.entity';
import { MailService } from '../mail/mail.service';
import { SubmitOnboardingRequestDto } from './dto/submit-onboarding-request.dto';
import { FORMS_ERRORS } from './constants/forms.constants';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private readonly formSubmissionRepo: FormSubmissionRepository,
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async submitOnboardingRequest(dto: SubmitOnboardingRequestDto) {
    const email = dto.email.toLowerCase().trim();
    const companyName = dto.companyName.trim();

    // 1. Rate Limiting Check: Max 3 submissions per email address within last 24 hours
    const submissionCount = await this.formSubmissionRepo.countSubmissionsByEmail(
      email,
      FormType.ORGANIZATION_ONBOARDING_REQUEST,
      24,
    );

    if (submissionCount >= 3) {
      this.logger.warn(`Email throttling triggered for onboarding request: ${email}`);
      throw new Error(FORMS_ERRORS.TOO_MANY_REQUESTS_PER_EMAIL);
    }

    // 2. Check if this exact Email + Company Name already has a PENDING/IN_REVIEW request
    const existingEmailCompanySubmission =
      await this.formSubmissionRepo.findPendingByEmailAndCompany(
        email,
        companyName,
        FormType.ORGANIZATION_ONBOARDING_REQUEST,
      );

    if (existingEmailCompanySubmission) {
      throw new Error(FORMS_ERRORS.ACTIVE_EMAIL_COMPANY_REQUEST_EXISTS);
    }

    // 3. Check if Company Name alone already has an active PENDING/IN_REVIEW request from any submitter
    const existingCompanySubmission = await this.formSubmissionRepo.findPendingByCompany(
      companyName,
      FormType.ORGANIZATION_ONBOARDING_REQUEST,
    );

    if (existingCompanySubmission) {
      throw new Error(FORMS_ERRORS.ACTIVE_COMPANY_REQUEST_EXISTS);
    }

    // 4. Save Submission
    const submission = await this.formSubmissionRepo.createAndSave({
      formType: FormType.ORGANIZATION_ONBOARDING_REQUEST,
      status: FormSubmissionStatus.PENDING,
      contactName: dto.contactName.trim(),
      email,
      phone: dto.phone?.trim(),
      companyName,
      companySize: dto.companySize?.trim(),
      industry: dto.industry?.trim(),
      website: dto.website?.trim(),
      message: dto.message?.trim(),
    });

    // 5. Query all Super Admins from database + env to send notification emails
    try {
      const superAdminEmails = await this.userRepo.findSuperAdminEmails();

      if (superAdminEmails.length > 0) {
        for (const adminEmail of superAdminEmails) {
          this.mailService
            .sendNewOnboardingRequestMail({
              toEmail: adminEmail,
              contactName: submission.contactName,
              email: submission.email,
              companyName: submission.companyName || companyName,
              phone: submission.phone,
              companySize: submission.companySize,
              industry: submission.industry,
              message: submission.message,
            })
            .catch((err) => {
              this.logger.error(
                `Failed to send onboarding email to Super Admin ${adminEmail}:`,
                err,
              );
            });
        }
      } else {
        this.logger.warn('No Super Admin emails found to send notification.');
      }
    } catch (err) {
      this.logger.error('Error fetching Super Admins for mail notification:', err);
    }

    this.logger.log(
      `New organization onboarding request submitted: '${companyName}' (${email}) - ID: ${submission.id}`,
    );

    return {
      message:
        'Your organization onboarding request has been submitted successfully. Our team will review it shortly.',
      submissionId: submission.id,
    };
  }
}
