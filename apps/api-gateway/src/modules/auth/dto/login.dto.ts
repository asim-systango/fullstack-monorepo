import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User login email address',
    example: 'alex.wright@acme.com',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiProperty({
    description: 'User account password',
    example: 'Temp-aB12345!',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @ApiPropertyOptional({
    description:
      'Optional organization slug for tenant verification (Keka-style tenant context)',
    example: 'acme-technologies-inc',
  })
  @IsOptional()
  @IsString()
  organizationSlug?: string;
}
