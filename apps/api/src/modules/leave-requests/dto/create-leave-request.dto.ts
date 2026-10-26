import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { IsYmdDate, Trim } from '../../../common/validation';

export class CreateLeaveRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  leaveTypeId!: string;

  @ApiProperty({ example: '2026-10-16' })
  @IsYmdDate()
  startDate!: string;

  @ApiProperty({ example: '2026-10-20' })
  @IsYmdDate()
  endDate!: string;

  @ApiProperty({ example: "Cousin's wedding", maxLength: 500 })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Please add a reason' })
  @MaxLength(500)
  reason!: string;
}
