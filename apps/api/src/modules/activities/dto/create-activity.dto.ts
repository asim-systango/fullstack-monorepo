import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../../../database/entities/activity.entity';

export class CreateActivityDto {
  @ApiPropertyOptional({
    description: 'ID of the associated lead',
    example: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
  })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'ID of the associated deal',
    example: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
  })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiProperty({
    description: 'Type of the activity',
    enum: ActivityType,
    example: ActivityType.CALL,
  })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  activityType!: ActivityType;

  @ApiProperty({ description: 'Title of the activity', example: 'Initial Intro Call' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed description or notes for the activity',
    example: 'Discuss requirements',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Due date in epoch milliseconds',
    example: 1756446803506,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dueAt?: number;
}
