import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PrescriptionMedicineDto {
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

  @ApiPropertyOptional({ example: '7 days' })
  @IsString()
  @IsOptional()
  duration?: string;
}

export class CreatePrescriptionDataDto {
  @ApiProperty({ type: [PrescriptionMedicineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionMedicineDto)
  medicines!: PrescriptionMedicineDto[];

  @ApiPropertyOptional({ example: 'Take with plenty of water and rest.' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreateMedicalNoteDataDto {
  @ApiProperty({ example: 'Patient displays mild symptoms of throat inflammation.' })
  @IsString()
  @IsNotEmpty()
  notes!: string;
}

export class CompleteAppointmentDto {
  @ApiPropertyOptional({ type: CreatePrescriptionDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePrescriptionDataDto)
  prescription?: CreatePrescriptionDataDto;

  @ApiPropertyOptional({ type: CreateMedicalNoteDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMedicalNoteDataDto)
  medicalNote?: CreateMedicalNoteDataDto;
}
