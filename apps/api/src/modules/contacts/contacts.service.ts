import { Injectable } from '@nestjs/common';
import { ContactRepository } from '../../database/repositories/contact.repository';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact, ContactSource } from '../../database/entities/contact.entity';
import { User } from '../../database/entities/user.entity';
import { CONTACTS_ERRORS } from './constants/contacts.constants';

@Injectable()
export class ContactsService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async createContact(
    createContactDto: CreateContactDto,
    currentUser: User,
  ): Promise<Contact> {
    const organizationId = currentUser.organizationId;
    if (!organizationId) {
      throw new Error(CONTACTS_ERRORS.USER_NO_ORG);
    }

    // Optional check for duplicates by email or phone within the organization
    if (createContactDto.email) {
      const existingEmail = await this.contactRepository.findByEmail(
        createContactDto.email,
        organizationId,
      );
      if (existingEmail) {
        throw new Error(CONTACTS_ERRORS.EMAIL_EXISTS);
      }
    }

    if (createContactDto.phone) {
      const existingPhone = await this.contactRepository.findByPhone(
        createContactDto.phone,
        organizationId,
      );
      if (existingPhone) {
        throw new Error(CONTACTS_ERRORS.PHONE_EXISTS);
      }
    }

    const contact = this.contactRepository.create({
      ...createContactDto,
      organizationId,
      createdBy: currentUser.id,
      source: createContactDto.source || ContactSource.MANUAL,
    });

    return this.contactRepository.save(contact);
  }
}
