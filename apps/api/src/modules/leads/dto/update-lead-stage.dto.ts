import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStage } from '../../../database/entities/lead.entity';

export class UpdateLeadStageDto {
  @ApiProperty({ description: 'The new stage for the lead', enum: LeadStage })
  @IsEnum(LeadStage)
  @IsNotEmpty()
  stage!: LeadStage;
}
