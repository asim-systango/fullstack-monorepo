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
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
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
      width: input.width ?? null,
      height: input.height ?? null,
      durationSeconds:
        input.durationSeconds === null || input.durationSeconds === undefined
          ? null
          : String(input.durationSeconds),
      defaultAltText: input.altText ?? null,
    });
  }
}
