import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Contact, ContactSource, ContactStatus } from '../entities/contact.entity';

export interface GetContactsFilters {
  orgId: string;
  search?: string;
  source?: ContactSource;
  status?: ContactStatus;
  page: number;
  limit: number;
}

@Injectable()
export class ContactRepository extends Repository<Contact> {
  constructor(private dataSource: DataSource) {
    super(Contact, dataSource.createEntityManager());
  }

  async getContactsList(filters: GetContactsFilters): Promise<[Contact[], number]> {
    const { orgId, search, source, status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createQueryBuilder('contact').where(
      'contact.organizationId = :orgId',
      { orgId },
    );

    if (search) {
      queryBuilder.andWhere(
        '(contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (source) {
      queryBuilder.andWhere('contact.source = :source', { source });
    }

    if (status) {
      queryBuilder.andWhere('contact.status = :status', { status });
    }

    queryBuilder.orderBy('contact.createdAt', 'DESC').skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findById(id: string): Promise<Contact | null> {
    return this.findOne({ where: { id } });
  }

  async findByEmail(email: string, organizationId: string): Promise<Contact | null> {
    return this.findOne({ where: { email, organizationId } });
  }

  async findByPhone(phone: string, organizationId: string): Promise<Contact | null> {
    return this.findOne({ where: { phone, organizationId } });
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<void> {
    await this.update(id, { ...data, updatedAt: Date.now() });
  }
}
