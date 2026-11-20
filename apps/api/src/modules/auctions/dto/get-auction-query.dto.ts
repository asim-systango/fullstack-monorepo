import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { AuctionStatus } from '../auctions.entity';

const AUCTION_STATUSES = ['open', 'closed', 'cancelled'] as const;

export class GetAuctionQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? 1 : value))
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, example: 20 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? 20 : value))
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Title search (case-insensitive substring)',
    example: 'camera',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  q?: string;

  @ApiPropertyOptional({ example: 'electronics' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    enum: AUCTION_STATUSES,
    example: 'open',
  })
  @IsOptional()
  @IsIn([...AUCTION_STATUSES])
  status?: AuctionStatus;

  @ApiPropertyOptional({
    description: 'Filter to auctions sold by this seller (UUID)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'Minimum current price (inclusive)',
    minimum: 0,
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum current price (inclusive)',
    minimum: 0,
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;
}
