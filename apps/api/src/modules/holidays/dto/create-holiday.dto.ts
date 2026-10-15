import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsYmdDate, Trim } from '../../../common/validation';

export class CreateHolidayDto {
  @ApiProperty({ example: '2026-12-25' })
  @IsYmdDate()
  date!: string;

  @ApiProperty({ example: 'Christmas', maxLength: 80 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;
}
