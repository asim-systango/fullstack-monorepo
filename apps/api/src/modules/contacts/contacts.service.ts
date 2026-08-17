import { Injectable } from '@nestjs/common';
import { ContactRepository } from '../../database/repositories/contact.repository';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { GetContactsDto } from './dto/get-contacts.dto';
import { Contact } from '../../database/entities/contact.entity';
import { User } from '../../database/entities/user.entity';
import { RoleName } from '../../database/entities/role.entity';
import { CONTACTS_ERRORS } from './constants/contacts.constants';

@Injectable()
export class ContactsService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async getContacts(
    userId: string,
    userOrganizationId: string,
    roleName: RoleName,
    query: GetContactsDto,
  ) {
    let orgId = userOrganizationId;

    if (roleName === RoleName.SUPER_ADMIN && query.organizationId) {
      orgId = query.organizationId;
    }

    if (!orgId) {
      throw new Error(CONTACTS_ERRORS.USER_NO_ORG);
    }

    const { search, source, status, page = 1, limit = 10 } = query;

    const [contacts, total] = await this.contactRepository.getContactsList({
      orgId,
      search,
      source,
      status,
      page,
      limit,
    });

    return {
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createContact(
    createContactDto: CreateContactDto,
    currentUser: User,
  ): Promise<Contact> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(CONTACTS_ERRORS.USER_NO_ORG);
    }

    if (createContactDto.email) {
      const existingEmail = await this.contactRepository.findByEmail(
        createContactDto.email,
        orgId,
      );
      if (existingEmail) {
        throw new Error(CONTACTS_ERRORS.EMAIL_EXISTS);
      }
    }

    const existingPhone = await this.contactRepository.findByPhone(
      createContactDto.phone,
      orgId,
    );
    if (existingPhone) {
      throw new Error(CONTACTS_ERRORS.PHONE_EXISTS);
    }

    const now = Date.now();
    const contact = this.contactRepository.create({
      ...createContactDto,
      organizationId: orgId,
      createdBy: currentUser.id,
      createdAt: now,
      updatedAt: now,
    });

    return this.contactRepository.save(contact);
  }

  async updateContact(
    id: string,
    updateContactDto: UpdateContactDto,
    currentUser: User,
  ): Promise<Contact> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(CONTACTS_ERRORS.USER_NO_ORG);
    }

    const contact = await this.contactRepository.findById(id);
    if (!contact || contact.organizationId !== orgId) {
      throw new Error(CONTACTS_ERRORS.CONTACT_NOT_FOUND);
    }

    if (updateContactDto.email && updateContactDto.email !== contact.email) {
      const existingEmail = await this.contactRepository.findByEmail(
        updateContactDto.email,
        orgId,
      );
      if (existingEmail) {
        throw new Error(CONTACTS_ERRORS.EMAIL_EXISTS);
      }
    }

    if (updateContactDto.phone && updateContactDto.phone !== contact.phone) {
      const existingPhone = await this.contactRepository.findByPhone(
        updateContactDto.phone,
        orgId,
      );
      if (existingPhone) {
        throw new Error(CONTACTS_ERRORS.PHONE_EXISTS);
      }
    }

    await this.contactRepository.updateContact(id, updateContactDto);
    return (await this.contactRepository.findById(id))!;
  }
}
