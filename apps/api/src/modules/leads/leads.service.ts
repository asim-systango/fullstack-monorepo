import { Injectable } from '@nestjs/common';
import { LeadRepository } from '../../database/repositories/lead.repository';
import { ContactRepository } from '../../database/repositories/contact.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { GetLeadsDto } from './dto/get-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { Lead, LeadSource, LeadStage } from '../../database/entities/lead.entity';
import { User } from '../../database/entities/user.entity';
import { RoleName } from '../../database/entities/role.entity';
import { LEADS_ERRORS } from './constants/leads.constants';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly contactRepository: ContactRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async getLeads(currentUser: User, userRole: string, query: GetLeadsDto) {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
    }

    const options = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      stage: query.stage,
      source: query.source,
      ownerId: userRole === 'SALES_REP' ? currentUser.id : query.ownerId,
    };

    return this.leadRepository.findLeads(orgId, options);
  }

  async createLead(
    createLeadDto: CreateLeadDto,
    currentUser: User,
    userRole: string,
  ): Promise<Lead> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
    }

    if (userRole === RoleName.SALES_REP) {
      throw new Error(LEADS_ERRORS.UNAUTHORIZED_ACCESS);
    }

    const contact = await this.contactRepository.findById(createLeadDto.contactId);
    if (!contact || contact.organizationId !== orgId) {
      throw new Error(LEADS_ERRORS.CONTACT_NOT_FOUND);
    }

    let assignedBy: string | undefined;

    if (createLeadDto.ownerId) {
      const owner = await this.userRepository.findById(createLeadDto.ownerId);
      if (!owner || owner.organizationId !== orgId) {
        throw new Error(LEADS_ERRORS.OWNER_NOT_FOUND);
      }
      assignedBy = currentUser.id;
    }

    const now = Date.now();
    const lead = this.leadRepository.create({
      organizationId: orgId,
      contactId: createLeadDto.contactId,
      title: createLeadDto.title,
      description: createLeadDto.description,
      source: createLeadDto.source || LeadSource.MANUAL,
      stage: LeadStage.NEW,
      ownerId: createLeadDto.ownerId,
      assignedBy,
      createdBy: currentUser.id,
      createdAt: now,
      updatedAt: now,
    });

    return this.leadRepository.save(lead);
  }

  async updateLead(
    id: string,
    updateLeadDto: UpdateLeadDto,
    currentUser: User,
    userRole: string,
  ): Promise<Lead> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead || lead.organizationId !== orgId) {
      throw new Error(LEADS_ERRORS.LEAD_NOT_FOUND);
    }

    // Role check: Only ORG_ADMIN, SUPER_ADMIN, or SALES_LEAD can update lead details
    if (userRole === RoleName.SALES_REP) {
      throw new Error(LEADS_ERRORS.UNAUTHORIZED_ACCESS);
    }

    if (updateLeadDto.contactId && updateLeadDto.contactId !== lead.contactId) {
      const contact = await this.contactRepository.findById(updateLeadDto.contactId);
      if (!contact || contact.organizationId !== orgId) {
        throw new Error(LEADS_ERRORS.CONTACT_NOT_FOUND);
      }
    }

    let assignedBy = lead.assignedBy;
    if (updateLeadDto.ownerId && updateLeadDto.ownerId !== lead.ownerId) {
      const owner = await this.userRepository.findById(updateLeadDto.ownerId);
      if (!owner || owner.organizationId !== orgId) {
        throw new Error(LEADS_ERRORS.OWNER_NOT_FOUND);
      }
      assignedBy = currentUser.id;
    }

    await this.leadRepository.updateLead(id, { ...updateLeadDto, assignedBy });
    return (await this.leadRepository.findDetailsById(id))!;
  }

  async updateLeadStage(
    id: string,
    updateLeadStageDto: UpdateLeadStageDto,
    currentUser: User,
    userRole: string,
  ): Promise<Lead> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead || lead.organizationId !== orgId) {
      throw new Error(LEADS_ERRORS.LEAD_NOT_FOUND);
    }

    // Role check: SALES_REP can only update stage for leads they own
    if (userRole === RoleName.SALES_REP && lead.ownerId !== currentUser.id) {
      throw new Error(LEADS_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Stage check: Once a lead is CONVERTED or LOST, it cannot be reverted to earlier stages
    if (
      (lead.stage === LeadStage.CONVERTED || lead.stage === LeadStage.LOST) &&
      updateLeadStageDto.stage !== LeadStage.CONVERTED &&
      updateLeadStageDto.stage !== LeadStage.LOST
    ) {
      throw new Error(LEADS_ERRORS.INVALID_STAGE_TRANSITION);
    }

    await this.leadRepository.updateLead(id, { stage: updateLeadStageDto.stage });
    return (await this.leadRepository.findDetailsById(id))!;
  }

  async getLeadDetails(id: string, currentUser: User, userRole: string): Promise<Lead> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
    }

    const lead = await this.leadRepository.findDetailsById(id);
    if (!lead || lead.organizationId !== orgId) {
      throw new Error(LEADS_ERRORS.LEAD_NOT_FOUND);
    }

    // Role check: SALES_REP can only view details for leads they own
    if (userRole === RoleName.SALES_REP && lead.ownerId !== currentUser.id) {
      throw new Error(LEADS_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return lead;
  }
}
