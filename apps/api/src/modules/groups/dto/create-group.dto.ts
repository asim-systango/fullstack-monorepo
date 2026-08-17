import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'Weekend trip' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ default: 'USD', example: 'USD' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  @IsIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
  currency!: string;
}
