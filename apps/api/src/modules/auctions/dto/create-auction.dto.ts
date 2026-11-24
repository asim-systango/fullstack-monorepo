import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MONEY_MAX } from '../../../common/money';

export class CreateAuctionDto {
  @ApiProperty({ example: 'Vintage camera' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Fully working 35mm film camera' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: 'electronics' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 500, minimum: 0.01, maximum: MONEY_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MONEY_MAX)
  startingPrice!: number;

  @ApiProperty({ example: 50, minimum: 0.01, maximum: MONEY_MAX })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MONEY_MAX)
  minIncrement!: number;

  @ApiProperty({ example: '2026-12-31T18:00:00.000Z' })
  @IsDateString()
  endsAt!: string;
}
