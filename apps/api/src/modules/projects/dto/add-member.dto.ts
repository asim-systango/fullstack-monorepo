import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'user@demo.local' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: ['lead', 'member'], default: 'member' })
  @IsOptional()
  @IsIn(['lead', 'member'])
  role?: 'lead' | 'member';
}
