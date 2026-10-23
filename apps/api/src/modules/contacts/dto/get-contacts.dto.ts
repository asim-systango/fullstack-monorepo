import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ContactStatus, ContactSource } from '../../../database/entities/contact.entity';

export class GetContactsDto {
  @ApiPropertyOptional({
    description: 'Filter by organization ID (Super Admin only)',
    example: '01HQ1W60JYYFGF9S5A23Z7S6XV',
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Search term for name, email, or phone',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by contact source', enum: ContactSource })
  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource;

  @ApiPropertyOptional({ description: 'Filter by contact status', enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
