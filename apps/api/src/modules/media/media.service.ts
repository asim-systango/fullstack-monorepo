import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { StorageService } from '../storage';
import {
  ALLOWED_MIME_TYPES,
  getFileFormat,
  getMaxFileSize,
  getResourceType,
  getUploadFolder,
} from './media.constants';
import { MediaRepository } from './media.repository';
import type { MediaDto } from './dto/media.dto';
import type { Media } from './media.entity';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async upload(
    file: Express.Multer.File | undefined,
    user: JwtUser,
    altText?: string,
  ): Promise<MediaDto> {
    if (!file?.buffer || file.size === 0) {
      throw new BadRequestException('file is required');
    }

    const mimeType = file.mimetype?.toLowerCase() ?? '';
    const resourceType = getResourceType(mimeType);
    if (!resourceType) {
      throw new BadRequestException({
        message: 'Unsupported media type',
        details: { mimeType, allowed: ALLOWED_MIME_TYPES },
      });
    }

    const maxBytes = getMaxFileSize(resourceType);
    if (file.size > maxBytes) {
      throw new BadRequestException({
        message: 'File too large',
        details: { maxBytes, size: file.size, resourceType },
      });
    }

    const format = getFileFormat(mimeType);
    if (!format) {
      throw new BadRequestException('Could not determine media format');
    }

    const uploaded = await this.storage.uploadFile(file.buffer, file.originalname, {
      prefix: getUploadFolder(user.id),
      resourceType,
    });

    try {
      const media = await this.mediaRepository.create({
        uploaderId: user.id,
        publicId: uploaded.key,
        resourceType,
        format,
        url: uploaded.url,
        bytes: file.size,
        altText: altText?.trim() || undefined,
      });
      return this.toDto(media);
    } catch (error) {
      try {
        await this.storage.deleteFile(uploaded.key, { resourceType });
      } catch (cleanupError) {
        this.logger.warn(
          `Cloudinary cleanup failed for key=${uploaded.key}: ${
            cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
          }`,
        );
      }
      throw error;
    }
  }

  toDto(media: Media): MediaDto {
    return {
      id: media.id,
      url: media.secureUrl,
      resourceType: media.resourceType,
      format: media.format,
      width: media.width,
      height: media.height,
      bytes: Number(media.bytes),
      durationSeconds:
        media.durationSeconds !== null ? Number(media.durationSeconds) : null,
      altText: media.defaultAltText,
      createdAt: media.createdAt,
    };
  }
}
