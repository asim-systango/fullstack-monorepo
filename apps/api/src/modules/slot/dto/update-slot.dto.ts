import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SlotStatus } from '../../../shared/enums/slot-status.enum';

/** DTO for updating a slot (primarily status changes: BLOCK/UNBLOCK). */
export class UpdateSlotDto {
  @ApiPropertyOptional({ enum: SlotStatus, description: 'New slot status' })
  @IsEnum(SlotStatus)
  @IsOptional()
  status?: SlotStatus;
}
