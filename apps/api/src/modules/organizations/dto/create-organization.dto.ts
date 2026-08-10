import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corporation', description: 'Name of the organization' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  name!: string;

  @ApiProperty({ example: 'acme.com', description: 'Primary domain of the organization' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  primaryDomain!: string;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Official organization contact email',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: '+1-555-0199',
    description: 'Official organization phone number',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Technology', description: 'Industry classification' })
  @IsString()
  @IsNotEmpty()
  industry!: string;

  @ApiPropertyOptional({ example: 'https://acme.com/logo.png', description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://acme.com', description: 'Website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    example: '123 Tech Lane, Silicon Valley, CA',
    description: 'Physical address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata', description: 'Timezone string' })
  @IsOptional()
  @IsString()
  timezone?: string;

  // Organization Admin User Details
  @ApiProperty({
    example: 'John',
    description: 'First name of the primary organization admin',
  })
  @IsString()
  @IsNotEmpty()
  adminFirstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the primary organization admin',
  })
  @IsString()
  @IsNotEmpty()
  adminLastName!: string;

  @ApiProperty({
    example: 'john.doe@acme.com',
    description: 'Email address of the primary organization admin',
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail!: string;

  @ApiPropertyOptional({
    example: '+1-555-0188',
    description: 'Phone number of the primary organization admin',
  })
  @IsOptional()
  @IsString()
  adminPhone?: string;
}
