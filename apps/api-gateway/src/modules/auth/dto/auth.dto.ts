import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'patient@hospital.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Patient@123',
    description:
      'Must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_-])[A-Za-z\d@$!%*?&#^()_-]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'PATIENT', enum: ['PATIENT', 'DOCTOR'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'Cardiology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @ApiPropertyOptional({ example: 'MD, FACC' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  qualification?: string;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ example: 150.0, minimum: 0 })
  @IsOptional()
  consultationFee?: number;

  @ApiPropertyOptional({ example: 'Experienced cardiologist with 10+ years experience.' })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profileImage?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'patient@hospital.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Patient@123' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token string if not supplied via cookie' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class TokenResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  user!: Record<string, unknown>;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'Current@123' })
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description:
      'Must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_-])[A-Za-z\d@$!%*?&#^()_-]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword!: string;
}
