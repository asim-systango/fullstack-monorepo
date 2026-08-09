import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { RevisionMedia } from '../media/revision-media.entity';
import { Article } from './article.entity';

/**
 * Ordered block document for an article version.
 * `content` (JSONB) is the source of truth; `revision_media` is a derived index.
 * `coverMediaId` is the singleton cover (not a flow block).
 *
 * `createdBy` is an opaque gateway user UUID — no local User FK.
 */
@Entity({ name: 'revisions' })
@Check(
  'CHK_revision_content_is_array',
  `jsonb_typeof("content") = 'array' AND jsonb_array_length("content") > 0`,
)
@Index('IDX_revisions_article_id_created_at', ['articleId', 'createdAt'])
@Index('IDX_revisions_created_by', ['createdBy'])
@Index('IDX_revisions_cover_media_id', ['coverMediaId'], {
  where: '"cover_media_id" IS NOT NULL',
})
export class Revision {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'article_id', type: 'uuid' })
  articleId!: string;

  @ManyToOne(() => Article, (article) => article.revisions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  /** Ordered typed blocks (paragraph, heading, image, video, code, …). */
  @Column({ type: 'jsonb' })
  content!: unknown[];

  @Column({ name: 'cover_media_id', type: 'uuid', nullable: true })
  coverMediaId!: string | null;

  @ManyToOne(() => Media, (media) => media.coverForRevisions, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cover_media_id' })
  coverMedia!: Media | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @OneToMany(() => RevisionMedia, (revisionMedia) => revisionMedia.revision)
  revisionMedia!: RevisionMedia[];

  @OneToOne(() => Article, (article) => article.publishedRevision)
  publishedForArticle?: Article;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
