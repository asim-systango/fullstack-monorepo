import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactRepository } from '../../database/repositories/contact.repository';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, ContactRepository],
  exports: [ContactsService],
})
export class ContactsModule {}
