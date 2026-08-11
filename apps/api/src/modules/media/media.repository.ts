import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, type MediaResourceType } from './media.entity';

export type CreateMediaInput = {
  uploaderId: string;
  publicId: string;
  resourceType: MediaResourceType;
  format: string;
  url: string;
  bytes: number;
  altText?: string;
};

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  create(input: CreateMediaInput): Promise<Media> {
    return this.mediaRepo.save({
      uploaderId: input.uploaderId,
      cloudinaryPublicId: input.publicId,
      resourceType: input.resourceType,
      format: input.format,
      secureUrl: input.url,
      bytes: String(input.bytes),
      width: null,
      height: null,
      durationSeconds: null,
      defaultAltText: input.altText ?? null,
    });
  }
}
