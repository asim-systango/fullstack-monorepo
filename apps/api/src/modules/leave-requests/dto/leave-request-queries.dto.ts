import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination';
import { EmptyToUndefined, IsYmdDate } from '../../../common/validation';
import { LEAVE_STATUSES, type LeaveStatus } from '../leave-status';

export class QuoteQueryDto {
  @ApiProperty({ example: '2026-10-16' })
  @IsYmdDate()
  startDate!: string;

  @ApiProperty({ example: '2026-10-20' })
  @IsYmdDate()
  endDate!: string;
}

export class MyLeaveRequestsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LEAVE_STATUSES })
  @EmptyToUndefined()
  @IsOptional()
  @IsIn(LEAVE_STATUSES)
  status?: LeaveStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @EmptyToUndefined()
  @IsOptional()
  @IsUUID()
  leaveTypeId?: string;

  @ApiPropertyOptional({
    example: '2026-10-01',
    description: 'Requests ending on or after this date',
  })
  @EmptyToUndefined()
  @IsOptional()
  @IsYmdDate()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-10-31',
    description: 'Requests starting on or before this date',
  })
  @EmptyToUndefined()
  @IsOptional()
  @IsYmdDate()
  to?: string;
}

export class ListLeaveRequestsQueryDto extends MyLeaveRequestsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @EmptyToUndefined()
  @IsOptional()
  @IsUUID()
  userId?: string;

  // kept as a string, implicit conversion would turn "false" into true
  @ApiPropertyOptional({ enum: ['true', 'false'], description: 'Admin only' })
  @EmptyToUndefined()
  @IsOptional()
  @IsIn(['true', 'false'])
  includeDeleted?: 'true' | 'false';
}

export class AwayQueryDto {
  @ApiPropertyOptional({
    example: '2026-10-15',
    description: 'First day, defaults to today (IST)',
  })
  @EmptyToUndefined()
  @IsOptional()
  @IsYmdDate()
  from?: string;
}
