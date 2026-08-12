import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../database/repositories/organization.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { FormSubmissionRepository } from '../../database/repositories/form-submission.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly userRepo: UserRepository,
    private readonly formSubmissionRepo: FormSubmissionRepository,
  ) {}

  async getOverallKpis() {
    const [orgKpis, userKpis, formKpis] = await Promise.all([
      this.orgRepo.getKpis(),
      this.userRepo.getKpis(),
      this.formSubmissionRepo.getKpis(),
    ]);

    return {
      organizations: {
        total: orgKpis.total,
        active: orgKpis.active,
      },
      platformUsers: {
        total: userKpis.totalPlatformUsers,
        pendingInvites: userKpis.pendingInvites,
      },
      organizationRequests: {
        total: formKpis.total,
        pending: formKpis.pending,
        inReview: formKpis.inReview,
        approved: formKpis.approved,
        rejected: formKpis.rejected,
      },
    };
  }
}
