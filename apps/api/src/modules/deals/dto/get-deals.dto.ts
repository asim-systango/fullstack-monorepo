import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DealStage } from '../../../database/entities/deal.entity';

export class GetDealsDto {
  @ApiPropertyOptional({
    description: 'Search deal title, contact name or contact email',
    example: 'Enterprise',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by deal stage', enum: DealStage })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @ApiPropertyOptional({ description: 'Filter by owner ID' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
