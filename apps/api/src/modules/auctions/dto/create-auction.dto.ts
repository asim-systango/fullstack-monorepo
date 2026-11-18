import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAuctionDto {
  @ApiProperty({ example: 'Vintage camera' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Fully working 35mm film camera' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'electronics' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 500, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  startingPrice!: number;

  @ApiProperty({ example: 50, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  minIncrement!: number;

  @ApiProperty({ example: '2026-12-31T18:00:00.000Z' })
  @IsDateString()
  endsAt!: string;
}
