import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitOnboardingRequestDto {
  @ApiProperty({
    description: 'Full name of the contact person',
    example: 'Harsh Vyas',
  })
  @IsNotEmpty({ message: 'Contact name is required' })
  @IsString()
  @MaxLength(150, { message: 'Contact name cannot exceed 150 characters' })
  contactName!: string;

  @ApiProperty({
    description: 'Work email address of the contact person',
    example: 'harsh.vyas@systango.com',
  })
  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(255, { message: 'Email address cannot exceed 255 characters' })
  email!: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1 555-0192',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'Phone number cannot exceed 30 characters' })
  phone?: string;

  @ApiProperty({
    description: 'Name of the company/organization requesting CRM access',
    example: 'Systango Technologies',
  })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  @MaxLength(150, { message: 'Company name cannot exceed 150 characters' })
  companyName!: string;

  @ApiPropertyOptional({
    description: 'Company size range (e.g. 1-10, 11-50, 51-200, 500+)',
    example: '51-200',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Company size cannot exceed 50 characters' })
  companySize?: string;

  @ApiPropertyOptional({
    description: 'Industry domain of the company',
    example: 'Information Technology',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Industry cannot exceed 100 characters' })
  industry?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://systango.com',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Website URL cannot exceed 255 characters' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Additional requirements or message from the submitter',
    example: 'We require custom CRM integrations for lead management.',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
