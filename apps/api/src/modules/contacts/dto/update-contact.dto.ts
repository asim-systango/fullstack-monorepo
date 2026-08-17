import { PartialType } from '@nestjs/swagger';
import { CreateContactDto } from './create-contact.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ContactStatus } from '../../../database/entities/contact.entity';

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiPropertyOptional({ description: 'Status of the contact', enum: ContactStatus })
  @IsEnum(ContactStatus)
  @IsOptional()
  status?: ContactStatus;
}
