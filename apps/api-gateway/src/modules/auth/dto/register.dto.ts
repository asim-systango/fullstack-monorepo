import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDTO {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ maxLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}
