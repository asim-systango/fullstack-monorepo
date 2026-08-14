import { Injectable } from '@nestjs/common';
import { DealRepository } from '../../database/repositories/deal.repository';
import { LeadRepository } from '../../database/repositories/lead.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { CreateDealDto } from './dto/create-deal.dto';
import { Deal, DealStage } from '../../database/entities/deal.entity';
import { LeadStage } from '../../database/entities/lead.entity';
import { User } from '../../database/entities/user.entity';
import { DEALS_ERRORS } from './constants/deals.constants';

@Injectable()
export class DealsService {
  constructor(
    private readonly dealRepository: DealRepository,
    private readonly leadRepository: LeadRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createDeal(
    createDealDto: CreateDealDto,
    currentUser: User,
    userRole: string,
  ): Promise<Deal> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(DEALS_ERRORS.USER_NO_ORG);
    }

    // 1. Fetch Lead
    const lead = await this.leadRepository.findById(createDealDto.leadId);
    if (!lead || lead.organizationId !== orgId) {
      throw new Error(DEALS_ERRORS.LEAD_NOT_FOUND);
    }

    // 2. Role-based ownership check
    if (userRole === 'SALES_REP' && lead.ownerId !== currentUser.id) {
      throw new Error(DEALS_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // 3. Check if deal already exists for this lead (1:1 constraint for MVP)
    const existingDeal = await this.dealRepository.findOne({
      where: { leadId: lead.id },
    });
    if (existingDeal) {
      throw new Error(DEALS_ERRORS.LEAD_ALREADY_CONVERTED);
    }

    // 4. Resolve owner (fallback to lead owner or currentUser)
    let ownerId = createDealDto.ownerId || lead.ownerId || currentUser.id;
    if (createDealDto.ownerId) {
      const owner = await this.userRepository.findById(createDealDto.ownerId);
      if (!owner || owner.organizationId !== orgId) {
        throw new Error(DEALS_ERRORS.OWNER_NOT_FOUND);
      }
      ownerId = owner.id;
    }

    // 5. Create Deal
    const now = Date.now();
    const deal = this.dealRepository.create({
      organizationId: orgId,
      leadId: lead.id,
      contactId: lead.contactId, // inherit contact from lead
      title: createDealDto.title,
      description: createDealDto.description,
      amount: createDealDto.amount,
      probability: createDealDto.probability || 0,
      stage: DealStage.OPEN,
      expectedCloseDate: createDealDto.expectedCloseDate,
      ownerId,
      createdBy: currentUser.id,
      createdAt: now,
      updatedAt: now,
    });

    const savedDeal = await this.dealRepository.save(deal);

    // 6. Update Lead to CONVERTED
    await this.leadRepository.updateLead(lead.id, {
      stage: LeadStage.CONVERTED,
      convertedAt: now,
    });

    return savedDeal;
  }

  async getAllDeals(currentUser: User, userRole: string): Promise<Deal[]> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(DEALS_ERRORS.USER_NO_ORG);
    }

    // SALES_REP can only see their assigned deals
    const ownerId = userRole === 'SALES_REP' ? currentUser.id : undefined;

    return this.dealRepository.findAllDeals(orgId, ownerId);
  }
}
