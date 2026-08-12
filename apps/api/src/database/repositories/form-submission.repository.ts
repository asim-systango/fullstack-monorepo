import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FormSubmission,
  FormSubmissionStatus,
  FormType,
} from '../entities/form-submission.entity';
import {
  GetFormSubmissionsQueryDto,
  SortOrder,
} from '../../modules/forms/dto/get-form-submissions-query.dto';

export interface PaginatedFormSubmissionsResult {
  data: FormSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

  async getKpis(formType: FormType = FormType.ORGANIZATION_ONBOARDING_REQUEST): Promise<{
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  }> {
    const total = await this.repo.count({ where: { formType } });
    const pending = await this.repo.count({
      where: { formType, status: FormSubmissionStatus.PENDING },
    });
    const inReview = await this.repo.count({
      where: { formType, status: FormSubmissionStatus.IN_REVIEW },
    });
    const approved = await this.repo.count({
      where: { formType, status: FormSubmissionStatus.APPROVED },
    });
    const rejected = await this.repo.count({
      where: { formType, status: FormSubmissionStatus.REJECTED },
    });

    return { total, pending, inReview, approved, rejected };
  }

  async findPaginated(
    query: GetFormSubmissionsQueryDto,
  ): Promise<PaginatedFormSubmissionsResult> {
    const {
      page = 1,
      limit = 10,
      search,
      formType,
      status,
      sortOrder = SortOrder.DESC,
    } = query;

    const qb = this.repo.createQueryBuilder('fs');

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(fs.contactName) LIKE :search OR LOWER(fs.email) LIKE :search OR LOWER(fs.companyName) LIKE :search)',
        { search: searchTerm },
      );
    }

    if (formType) {
      qb.andWhere('fs.formType = :formType', { formType });
    }

    if (status) {
      qb.andWhere('fs.status = :status', { status });
    }

    const skip = (page - 1) * limit;

    const [data, total] = await qb
      .orderBy('fs.createdAt', sortOrder === SortOrder.ASC ? 'ASC' : 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
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
