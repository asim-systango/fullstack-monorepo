import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { EmptyToUndefined } from '../../../common/validation';

export class MyBalancesQueryDto {
  @ApiPropertyOptional({
    example: 2026,
    description: 'Defaults to the current year (IST)',
  })
  @EmptyToUndefined()
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

export class EmployeeBalancesQueryDto extends MyBalancesQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;
}
