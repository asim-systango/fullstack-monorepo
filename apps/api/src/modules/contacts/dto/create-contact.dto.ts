import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactSource } from '../../../database/entities/contact.entity';

export class CreateContactDto {
  @ApiProperty({ description: 'First name of the contact', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ description: 'Last name of the contact', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Email address of the contact',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Phone number of the contact', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional({ description: 'Company name', example: 'Acme Corp' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Designation / Job Title',
    example: 'Software Engineer',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  designation?: string;

  @ApiPropertyOptional({
    description: 'Source of the contact',
    enum: ContactSource,
    default: ContactSource.MANUAL,
  })
  @IsEnum(ContactSource)
  @IsOptional()
  source?: ContactSource;
}
