import { Injectable, ForbiddenException } from '@nestjs/common';
import { OrganizationRepository } from '../../database/repositories/organization.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { FormSubmissionRepository } from '../../database/repositories/form-submission.repository';
import { LeadRepository } from '../../database/repositories/lead.repository';
import { DealRepository } from '../../database/repositories/deal.repository';
import { ContactRepository } from '../../database/repositories/contact.repository';
import { User } from '../../database/entities/user.entity';
import { LeadStage } from '../../database/entities/lead.entity';
import { DealStage } from '../../database/entities/deal.entity';
import { DASHBOARD_ERRORS } from './constants/dashboard.constants';

@Injectable()
export class DashboardService {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly userRepo: UserRepository,
    private readonly formSubmissionRepo: FormSubmissionRepository,
    private readonly leadRepo: LeadRepository,
    private readonly dealRepo: DealRepository,
    private readonly contactRepo: ContactRepository,
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

  async getCrmKpis(currentUser: User, userRole: string) {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new ForbiddenException(DASHBOARD_ERRORS.USER_NO_ORG);
    }

    const isSalesRep = userRole === 'SALES_REP';
    const ownerId = isSalesRep ? currentUser.id : undefined;

    // 1. Leads Metrics
    const leadQuery = this.leadRepo
      .createQueryBuilder('lead')
      .where('lead.organizationId = :orgId', { orgId });

    if (ownerId) {
      leadQuery.andWhere('lead.ownerId = :ownerId', { ownerId });
    }

    const [allLeads, totalLeadsCount] = await leadQuery.getManyAndCount();

    const openLeadsCount = allLeads.filter(
      (l) => l.stage !== LeadStage.CONVERTED && l.stage !== LeadStage.LOST,
    ).length;

    // 2. Deals Metrics
    const dealQuery = this.dealRepo
      .createQueryBuilder('deal')
      .where('deal.organizationId = :orgId', { orgId });

    if (ownerId) {
      dealQuery.andWhere('deal.ownerId = :ownerId', { ownerId });
    }

    const allDeals = await dealQuery.getMany();

    const activeDeals = allDeals.filter(
      (d) => d.stage !== DealStage.WON && d.stage !== DealStage.LOST,
    );
    const openPipelineAmount = activeDeals.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0,
    );
    const activeDealsCount = activeDeals.length;

    const wonDeals = allDeals.filter((d) => d.stage === DealStage.WON);
    const wonAmount = wonDeals.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0,
    );
    const wonDealsCount = wonDeals.length;

    const lostDeals = allDeals.filter((d) => d.stage === DealStage.LOST);
    const lostDealsCount = lostDeals.length;

    // 3. Contacts Count (Organization level)
    const contactsCount = await this.contactRepo.count({
      where: { organizationId: orgId },
    });

    return {
      openLeadsCount,
      totalLeadsCount,
      openPipelineAmount,
      activeDealsCount,
      wonAmount,
      wonDealsCount,
      contactsCount,
      lostDealsCount,
    };
  }
}
