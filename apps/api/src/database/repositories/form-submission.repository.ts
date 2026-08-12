import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FormSubmission,
  FormSubmissionStatus,
  FormType,
} from '../entities/form-submission.entity';

@Injectable()
export class FormSubmissionRepository {
  constructor(
    @InjectRepository(FormSubmission)
    private readonly repo: Repository<FormSubmission>,
  ) {}

  getRepo(): Repository<FormSubmission> {
    return this.repo;
  }

  async findById(id: string): Promise<FormSubmission | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findPendingByEmailAndCompany(
    email: string,
    companyName: string,
    formType: FormType = FormType.ORGANIZATION_ONBOARDING_REQUEST,
  ): Promise<FormSubmission | null> {
    return this.repo
      .createQueryBuilder('fs')
      .where('fs.formType = :formType', { formType })
      .andWhere('fs.status IN (:...activeStatuses)', {
        activeStatuses: [FormSubmissionStatus.PENDING, FormSubmissionStatus.IN_REVIEW],
      })
      .andWhere('(LOWER(fs.email) = :email AND LOWER(fs.companyName) = :companyName)', {
        email: email.toLowerCase().trim(),
        companyName: companyName.toLowerCase().trim(),
      })
      .getOne();
  }

  async findPendingByCompany(
    companyName: string,
    formType: FormType = FormType.ORGANIZATION_ONBOARDING_REQUEST,
  ): Promise<FormSubmission | null> {
    return this.repo
      .createQueryBuilder('fs')
      .where('fs.formType = :formType', { formType })
      .andWhere('fs.status IN (:...activeStatuses)', {
        activeStatuses: [FormSubmissionStatus.PENDING, FormSubmissionStatus.IN_REVIEW],
      })
      .andWhere('LOWER(fs.companyName) = :companyName', {
        companyName: companyName.toLowerCase().trim(),
      })
      .getOne();
  }

  async countSubmissionsByEmail(
    email: string,
    formType: FormType = FormType.ORGANIZATION_ONBOARDING_REQUEST,
    withinLastHours: number = 24,
  ): Promise<number> {
    const cutoffTimestamp = Date.now() - withinLastHours * 60 * 60 * 1000;

    return this.repo
      .createQueryBuilder('fs')
      .where('LOWER(fs.email) = :email', { email: email.toLowerCase().trim() })
      .andWhere('fs.formType = :formType', { formType })
      .andWhere('fs.createdAt >= :cutoff', { cutoff: cutoffTimestamp })
      .getCount();
  }

  async createAndSave(data: Partial<FormSubmission>): Promise<FormSubmission> {
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }
    if (data.companyName) {
      data.companyName = data.companyName.trim();
    }
    const submission = this.repo.create(data);
    return this.repo.save(submission);
  }

  async updateStatus(
    id: string,
    status: FormSubmissionStatus,
    reviewedByUserId: string,
    reviewNotes?: string,
  ): Promise<void> {
    await this.repo.update(id, {
      status,
      reviewedBy: reviewedByUserId,
      reviewNotes,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}
