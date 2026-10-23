import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DealStage } from '../../../database/entities/deal.entity';

export class UpdateDealStageDto {
  @ApiProperty({
    description: 'The new stage of the deal',
    enum: DealStage,
    example: DealStage.PROPOSAL,
  })
  @IsEnum(DealStage)
  @IsNotEmpty()
  stage!: DealStage;
}
