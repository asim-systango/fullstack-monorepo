import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export const CLOUDINARY_UPLOAD_FOLDERS = ['restaurants', 'menu-items'] as const;

export type CloudinaryUploadFolder = (typeof CLOUDINARY_UPLOAD_FOLDERS)[number];

export class CloudinarySignatureQueryDto {
  @ApiProperty({ enum: CLOUDINARY_UPLOAD_FOLDERS, example: 'restaurants' })
  @IsString()
  @IsIn(CLOUDINARY_UPLOAD_FOLDERS)
  folder: CloudinaryUploadFolder;
}
