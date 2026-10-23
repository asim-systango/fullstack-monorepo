import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';
import { Trim } from '../../../common/validation';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'Casual', maxLength: 60 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: 12, minimum: 0, maximum: 366 })
  @IsInt()
  @Min(0)
  @Max(366)
  defaultDays!: number;
}
