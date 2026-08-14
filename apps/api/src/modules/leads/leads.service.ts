import { Injectable } from '@nestjs/common';
import { LeadRepository } from '../../database/repositories/lead.repository';
import { ContactRepository } from '../../database/repositories/contact.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { Lead, LeadSource, LeadStage } from '../../database/entities/lead.entity';
import { User } from '../../database/entities/user.entity';
import { LEADS_ERRORS } from './constants/leads.constants';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly contactRepository: ContactRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createLead(createLeadDto: CreateLeadDto, currentUser: User): Promise<Lead> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
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
  ): Promise<Lead> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead || lead.organizationId !== orgId) {
      throw new Error(LEADS_ERRORS.LEAD_NOT_FOUND);
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
    return (await this.leadRepository.findById(id))!;
  }

  async updateLeadStage(
    id: string,
    updateLeadStageDto: UpdateLeadStageDto,
    currentUser: User,
    userRole: string, // the role name
  ): Promise<Lead> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(LEADS_ERRORS.USER_NO_ORG);
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead || lead.organizationId !== orgId) {
      throw new Error(LEADS_ERRORS.LEAD_NOT_FOUND);
    }

    if (userRole === 'SALES_REP' && lead.ownerId !== currentUser.id) {
      throw new Error(LEADS_ERRORS.UNAUTHORIZED_ACCESS);
    }

    await this.leadRepository.updateLead(id, { stage: updateLeadStageDto.stage });
    return (await this.leadRepository.findById(id))!;
  }
}
