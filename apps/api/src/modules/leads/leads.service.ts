import { Injectable } from '@nestjs/common';
import { LeadRepository } from '../../database/repositories/lead.repository';
import { ContactRepository } from '../../database/repositories/contact.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
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
}
