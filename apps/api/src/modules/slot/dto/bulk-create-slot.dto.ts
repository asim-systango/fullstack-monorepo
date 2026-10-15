import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class ShiftDto {
  @ApiPropertyOptional({ description: 'Custom shift name', example: 'Morning OPD' })
  @Transform(emptyToUndefined)
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Shift start time (HH:MM or HH:MM:SS in 24h format)',
    example: '09:00',
  })
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'startTime must be in HH:MM format',
  })
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({
    description: 'Shift end time (HH:MM or HH:MM:SS in 24h format)',
    example: '13:00',
  })
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'endTime must be in HH:MM format',
  })
  @IsNotEmpty()
  endTime!: string;
}

export class BulkCreateSlotDto {
  @ApiProperty({ description: 'Doctor profile UUID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId!: string;

  @ApiProperty({
    description: 'Target start date in YYYY-MM-DD format or ISO string',
    example: '2026-08-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional({
    description:
      'Optional end date for multi-day schedule generation in YYYY-MM-DD format',
    example: '2026-08-22',
  })
  @Transform(emptyToUndefined)
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Optional active weekdays filter (0 = Sun, 1 = Mon, ..., 6 = Sat)',
    example: [1, 2, 3, 4, 5],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  daysOfWeek?: number[];

  @ApiPropertyOptional({
    description: 'Primary working hours start time (HH:MM in 24h format)',
    example: '09:00',
  })
  @Transform(emptyToUndefined)
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'startTime must be in HH:MM format',
  })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Primary working hours end time (HH:MM in 24h format)',
    example: '13:00',
  })
  @Transform(emptyToUndefined)
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'endTime must be in HH:MM format',
  })
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Optional Shift 2 start time (HH:MM in 24h format)',
    example: '14:00',
  })
  @Transform(emptyToUndefined)
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'shift2StartTime must be in HH:MM format',
  })
  @IsOptional()
  shift2StartTime?: string;

  @ApiPropertyOptional({
    description: 'Optional Shift 2 end time (HH:MM in 24h format)',
    example: '18:00',
  })
  @Transform(emptyToUndefined)
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'shift2EndTime must be in HH:MM format',
  })
  @IsOptional()
  shift2EndTime?: string;

  @ApiPropertyOptional({
    description: 'Dynamic list of custom named shifts',
    type: [ShiftDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftDto)
  @IsOptional()
  shifts?: ShiftDto[];

  @ApiPropertyOptional({
    description: 'Slot duration in minutes (default 30)',
    example: 30,
  })
  @IsInt()
  @IsOptional()
  slotDurationMinutes?: number;
}
