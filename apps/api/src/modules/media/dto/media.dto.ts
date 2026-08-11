import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MediaResourceType } from '../media.entity';

/** Public media payload returned by POST /media. */
export class MediaDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'CDN delivery URL.' })
  url!: string;

  @ApiProperty({ enum: ['image', 'video'] })
  resourceType!: MediaResourceType;

  @ApiProperty()
  format!: string;

  @ApiPropertyOptional()
  width?: number | null;

  @ApiPropertyOptional()
  height?: number | null;

  @ApiProperty()
  bytes!: number;

  @ApiPropertyOptional()
  durationSeconds?: number | null;

  @ApiPropertyOptional()
  altText?: string | null;

  @ApiProperty()
  createdAt!: Date;
}
