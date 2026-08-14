import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '../../../database/entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({
    description: 'ID of the associated contact',
    example: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
  })
  @IsString()
  @IsNotEmpty()
  contactId!: string;

  @ApiProperty({
    description: 'Title of the lead',
    example: 'Interested in Premium Plan',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the lead',
    example: 'User requested a demo.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Source of the lead', enum: LeadSource })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this lead',
    example: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
  })
  @IsString()
  @IsOptional()
  ownerId?: string;
}
