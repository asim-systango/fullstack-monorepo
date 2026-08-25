import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character';

export class RegisterDto {
  @ApiProperty({ example: 'tanishq@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    minLength: 8,
    example: 'User@1234',
    description: STRONG_PASSWORD_MESSAGE,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  password!: string;

  @ApiProperty({ example: 'Tanishq' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@tastygo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
