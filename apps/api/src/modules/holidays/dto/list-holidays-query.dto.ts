import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { EmptyToUndefined } from '../../../common/validation';

export class ListHolidaysQueryDto {
  @ApiPropertyOptional({ example: 2026, description: 'Defaults to the current year' })
  @EmptyToUndefined()
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
