import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LeadSource, LeadStage } from '../../../database/entities/lead.entity';

export class GetLeadsDto {
    @ApiPropertyOptional({
        description: 'Search title or contact name',
        example: 'Interested',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Filter by lead stage', enum: LeadStage })
    @IsOptional()
    @IsEnum(LeadStage)
    stage?: LeadStage;

    @ApiPropertyOptional({ description: 'Filter by lead source', enum: LeadSource })
    @IsOptional()
    @IsEnum(LeadSource)
    source?: LeadSource;

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
