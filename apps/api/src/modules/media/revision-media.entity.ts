import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Revision } from '../articles/revision.entity';
import { Media } from './media.entity';

export type RevisionMediaRole = 'cover' | 'inline';

/**
 * Derived usage index for media referenced by a revision.
 * Rebuilt on revision save from `content` + `coverMediaId` — not client input.
 */
@Entity({ name: 'revision_media' })
@Check('CHK_revision_media_role', `"role" IN ('cover', 'inline')`)
@Check(
  'CHK_revision_media_role_block',
  `(("role" = 'cover' AND "block_id" = 'cover') OR ("role" = 'inline' AND "block_id" <> 'cover'))`,
)
@Index('IDX_revision_media_media_id', ['mediaId'])
@Index('IDX_revision_media_revision_id', ['revisionId'])
@Index('IDX_revision_media_one_cover', ['revisionId'], {
  unique: true,
  where: `"role" = 'cover'`,
})
export class RevisionMedia {
  @PrimaryColumn({ name: 'revision_id', type: 'uuid' })
  revisionId!: string;

  @PrimaryColumn({ name: 'media_id', type: 'uuid' })
  mediaId!: string;

  @PrimaryColumn({ name: 'block_id', type: 'text' })
  blockId!: string;

  @Column({ type: 'varchar', length: 10 })
  role!: RevisionMediaRole;

  @ManyToOne(() => Revision, (revision) => revision.revisionMedia, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'revision_id' })
  revision!: Revision;

  @ManyToOne(() => Media, (media) => media.revisionMedia, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'media_id' })
  media!: Media;
}
