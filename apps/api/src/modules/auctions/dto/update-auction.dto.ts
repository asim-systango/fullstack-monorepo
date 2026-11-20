import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateAuctionDto {
  @ApiPropertyOptional({ example: 'New Auction Title' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description for the auction' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'new-category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 600, minimum: 0.01 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  startingPrice?: number;

  @ApiPropertyOptional({ example: 60, minimum: 0.01 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  minIncrement?: number;

  @ApiPropertyOptional({ example: '2027-12-31T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
