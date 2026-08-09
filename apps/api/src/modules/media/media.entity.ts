import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Revision } from '../articles/revision.entity';
import { RevisionMedia } from './revision-media.entity';

export type MediaResourceType = 'image' | 'video';

/**
 * Cloudinary-backed asset metadata. Bytes live in Cloudinary.
 * `uploaderId` is an opaque gateway user UUID — no local User FK.
 */
@Entity({ name: 'media' })
@Check('CHK_media_resource_type', `"resource_type" IN ('image', 'video')`)
@Check('CHK_media_bytes', `"bytes" >= 0`)
@Check(
  'CHK_media_dimensions',
  `(("width" IS NULL AND "height" IS NULL) OR ("width" > 0 AND "height" > 0))`,
)
@Check('CHK_media_duration', `"duration_seconds" IS NULL OR "duration_seconds" >= 0`)
@Index('IDX_media_uploader_id', ['uploaderId'])
@Index('IDX_media_deleted_at', ['deletedAt'])
@Index('IDX_media_resource_type', ['resourceType'])
@Index('UQ_media_cloudinary_asset', ['resourceType', 'cloudinaryPublicId'], {
  unique: true,
})
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'uploader_id', type: 'uuid' })
  uploaderId!: string;

  @Column({ name: 'cloudinary_public_id', type: 'text' })
  cloudinaryPublicId!: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 10 })
  resourceType!: MediaResourceType;

  @Column({ type: 'varchar', length: 20 })
  format!: string;

  @Column({ name: 'secure_url', type: 'text' })
  secureUrl!: string;

  @Column({ type: 'bigint' })
  bytes!: string;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  @Column({
    name: 'duration_seconds',
    type: 'numeric',
    precision: 10,
    scale: 3,
    nullable: true,
  })
  durationSeconds!: string | null;

  @Column({ name: 'default_alt_text', type: 'varchar', length: 255, nullable: true })
  defaultAltText!: string | null;

  @OneToMany(() => RevisionMedia, (revisionMedia) => revisionMedia.media)
  revisionMedia!: RevisionMedia[];

  @OneToMany(() => Revision, (revision) => revision.coverMedia)
  coverForRevisions!: Revision[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
