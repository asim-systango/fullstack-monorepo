import { IsEmail, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProvisionMemberProfileDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName!: string;
}

export class SyncMemberProfileDto {
  @ApiProperty({ required: false })
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName?: string;
}
