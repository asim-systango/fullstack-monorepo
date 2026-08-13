import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsOptional,
  IsPositive,
  IsUUID,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** DTO for individual doctor verification document item. */
export class DoctorDocumentDto {
  @ApiPropertyOptional({ example: 'doc-1785933' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ example: 'medical_license.pdf' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Medical Council License' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ example: '/objects/abcd.pdf' })
  @IsString()
  @IsOptional()
  objectPath?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2026-08-13' })
  @IsString()
  @IsOptional()
  uploadedAt?: string;
}

/** DTO for creating a new doctor profile. */
export class CreateDoctorDto {
  @ApiProperty({ description: 'Gateway user UUID for this doctor' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'Rajesh', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Patel', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  specialization!: string;

  @ApiProperty({ example: 'MD, FACC' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  qualification!: string;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ example: 500.0, minimum: 0 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  consultationFee?: number;

  @ApiPropertyOptional({ example: 10.0, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  hospitalCharge?: number;

  @ApiPropertyOptional({
    example: 'Board-certified cardiologist with 10 years of clinical practice.',
  })
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiPropertyOptional({ example: 'https://example.com/dr-patel.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  profileImage?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsString()
  @IsOptional()
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Submitted verification documents',
    type: [DoctorDocumentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DoctorDocumentDto)
  @IsOptional()
  documents?: DoctorDocumentDto[];
}
