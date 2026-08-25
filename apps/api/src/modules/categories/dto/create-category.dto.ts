import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SlaPriority } from '../sla-policy.entity';

export class SlaPolicyItemDto {
  @ApiProperty({ enum: SlaPriority, example: SlaPriority.MEDIUM })
  @IsEnum(SlaPriority)
  priority!: SlaPriority;

  @ApiProperty({ example: 24, description: 'Hours allowed before first response' })
  @IsInt()
  @Min(1)
  firstResponseHours!: number;

  @ApiProperty({ example: 72, description: 'Hours allowed before resolution' })
  @IsInt()
  @Min(1)
  resolutionHours!: number;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Billing & Invoicing' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'billing-invoicing' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'Payment failures and refund requests' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [SlaPolicyItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlaPolicyItemDto)
  slaPolicies?: SlaPolicyItemDto[];
}
