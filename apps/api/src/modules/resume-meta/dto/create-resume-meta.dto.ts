import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateResumeMetaDto {
  @ApiProperty()
  @IsUrl()
  url!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label?: string;

  // Optional: Cloudinary public_id returned after direct signed upload (not a live FK).
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  cloudinaryPublicId?: string;
}
