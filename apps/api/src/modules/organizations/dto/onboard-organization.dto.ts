import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class OnboardOrganizationDto {
  @ApiProperty({
    example: 'Acme Technologies Inc',
    description: 'Official corporate name of the organization',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @ApiProperty({
    example: 'acme.com',
    description: 'Primary web domain of the organization',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  primaryDomain!: string;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Official organization contact email',
    required: true,
  })
  @IsDefined()
  @IsEmail({}, { message: 'Invalid corporate contact email format' })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  email!: string;

  @ApiProperty({
    example: '+1-555-0199',
    description: 'Official organization phone number',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  phone!: string;

  @ApiProperty({
    example: 'Software & Technology',
    description: 'Industry classification sector',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  industry!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.acme.com/assets/logo.png',
    description: 'URL pointing to organization logo image',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'https://acme.com',
    description: 'Official organization website URL',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  website?: string;

  @ApiPropertyOptional({
    example: '100 Innovation Way, Suite 400, San Francisco, CA',
    description: 'Physical address of primary headquarters',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({
    example: 'Asia/Kolkata',
    description: 'Default operational timezone',
    default: 'Asia/Kolkata',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  timezone?: string;

  // Primary Organization Administrator Contact Information
  @ApiProperty({
    example: 'Alexander',
    description: 'First name of the designated organization administrator',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  adminFirstName!: string;

  @ApiProperty({
    example: 'Wright',
    description: 'Last name of the designated organization administrator',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  adminLastName!: string;

  @ApiProperty({
    example: 'alex.wright@acme.com',
    description: 'Email address of the designated organization administrator',
    required: true,
  })
  @IsDefined()
  @IsEmail({}, { message: 'Invalid admin email address format' })
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  adminEmail!: string;

  @ApiPropertyOptional({
    example: '+1-555-0188',
    description: 'Direct phone number of the organization administrator',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  adminPhone?: string;
}
