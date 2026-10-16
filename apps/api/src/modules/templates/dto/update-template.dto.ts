import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateTemplateDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
