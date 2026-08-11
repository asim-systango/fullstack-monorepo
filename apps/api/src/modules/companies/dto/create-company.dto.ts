import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateCompanyDTO {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name!: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
