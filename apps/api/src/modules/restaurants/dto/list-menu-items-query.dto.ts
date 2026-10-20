import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class ListMenuItemsQueryDto {
  @ApiProperty({ description: 'Restaurant id' })
  @IsUUID()
  restaurantId: string;

  @ApiPropertyOptional({
    description: 'Staff/admin only — include soft-deleted items',
    default: false,
  })
  @IsOptional()
  @Transform(({ obj }) => {
    const raw = obj.includeDeleted;
    if (raw === undefined || raw === null || raw === '') return false;
    if (raw === true || raw === 'true') return true;
    return false;
  })
  @IsBoolean()
  includeDeleted?: boolean = false;
}
