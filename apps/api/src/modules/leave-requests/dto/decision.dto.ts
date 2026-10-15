import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../common/validation';

export class ApproveLeaveRequestDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class RejectLeaveRequestDto {
  @ApiProperty({ example: 'Release week, please pick another week', maxLength: 500 })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'A comment is required when rejecting' })
  @MaxLength(500)
  comment!: string;
}
