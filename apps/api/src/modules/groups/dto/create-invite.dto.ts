import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteDto {
  @ApiProperty({ example: 'friend@example.com' })
  @IsEmail()
  email!: string;
}
