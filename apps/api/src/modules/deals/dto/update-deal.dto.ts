import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDealDto {
  @ApiPropertyOptional({
    description: 'Title of the deal',
    example: 'Enterprise Software License',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the deal',
    example: '500 users license.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Estimated amount of the deal', example: 50000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Probability of winning the deal (0-100)',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  probability?: number;

  @ApiPropertyOptional({ description: 'Expected close date', example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this deal',
    example: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
  })
  @IsString()
  @IsOptional()
  ownerId?: string;
}
