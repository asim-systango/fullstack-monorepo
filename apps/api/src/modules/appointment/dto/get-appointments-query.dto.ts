import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';

export enum SortByField {
  STARTS_AT = 'startsAt',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAppointmentsQueryDto {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === 'ALL' ? undefined : value))
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'ISO 8601 start date' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 end date' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: SortByField, default: SortByField.STARTS_AT })
  @IsOptional()
  @IsEnum(SortByField)
  sortBy?: SortByField = SortByField.STARTS_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Doctor UUID filter' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Patient UUID filter' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Hospital-wide search query' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Alias for search query' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  q?: string;
}
