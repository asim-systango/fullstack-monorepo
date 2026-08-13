import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';

@Injectable()
export class ContactRepository extends Repository<Contact> {
  constructor(private dataSource: DataSource) {
    super(Contact, dataSource.createEntityManager());
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
}
