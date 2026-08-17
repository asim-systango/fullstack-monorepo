import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class MedicineItemDto {
  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @ApiProperty({ example: 'Twice daily after meals' })
  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @ApiPropertyOptional({ example: '5 days' })
  @IsString()
  @IsOptional()
  duration?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ type: [MedicineItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Medicines must not be empty' })
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  medicines!: MedicineItemDto[];

  @ApiPropertyOptional({
    description: 'Additional instructions (max 1000 chars)',
    example: 'Take after meals with water.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  instructions?: string;
}
