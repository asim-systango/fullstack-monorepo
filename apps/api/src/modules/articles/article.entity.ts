import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleTag } from '../tags/article-tag.entity';
import { Comment } from '../comments/comment.entity';
import { Revision } from './revision.entity';

/**
 * CMS article aggregate. Publication is derived from `publishedRevisionId`
 * (not a boolean flag), review from `submittedRevisionId`, and delayed publish
 * from `scheduledRevisionId`. The three pointers are independent; only
 * `publishedRevisionId` makes an article public. Soft-delete via `deletedAt`.
 *
 * `authorId` is an opaque gateway user UUID — no local User FK.
 */
@Entity({ name: 'articles' })
@Check(
  'CHK_articles_published_pair',
  `(("published_revision_id" IS NULL AND "published_at" IS NULL) OR ("published_revision_id" IS NOT NULL AND "published_at" IS NOT NULL))`,
)
@Check(
  'CHK_articles_submitted_pair',
  `(("submitted_revision_id" IS NULL AND "submitted_at" IS NULL) OR ("submitted_revision_id" IS NOT NULL AND "submitted_at" IS NOT NULL))`,
)
@Check(
  'CHK_articles_scheduled_pair',
  `(("scheduled_revision_id" IS NULL AND "scheduled_at" IS NULL) OR ("scheduled_revision_id" IS NOT NULL AND "scheduled_at" IS NOT NULL))`,
)
@Index('IDX_articles_author_id', ['authorId'])
@Index('IDX_articles_published_revision_id', ['publishedRevisionId'])
@Index('IDX_articles_deleted_at', ['deletedAt'])
@Index('IDX_articles_submitted_revision_id', ['submittedRevisionId'], {
  where: '"submitted_revision_id" IS NOT NULL',
})
@Index('IDX_articles_public', ['publishedAt'], {
  where: '"published_revision_id" IS NOT NULL AND "deleted_at" IS NULL',
})
// Editor review queue: submitted, and not already the live revision.
@Index('IDX_articles_review_queue', ['submittedAt'], {
  where:
    '"submitted_revision_id" IS NOT NULL AND "submitted_revision_id" IS DISTINCT FROM "published_revision_id" AND "deleted_at" IS NULL',
})
@Index('IDX_articles_scheduled_due', ['scheduledAt'], {
  where: '"scheduled_revision_id" IS NOT NULL AND "deleted_at" IS NULL',
})
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ name: 'meta_title', type: 'varchar', length: 200, nullable: true })
  metaTitle!: string | null;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription!: string | null;

  @Column({ name: 'og_image', type: 'varchar', length: 2000, nullable: true })
  ogImage!: string | null;

  @Column({ name: 'published_revision_id', type: 'uuid', nullable: true })
  publishedRevisionId!: string | null;

  /**
   * RESTRICT (not SET NULL): clearing only published_revision_id would leave
   * published_at set and violate CHK_articles_published_pair.
   */
  @OneToOne(() => Revision, (revision) => revision.publishedForArticle, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'published_revision_id' })
  publishedRevision!: Revision | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  /**
   * Review workflow, intentionally independent of the publish pointer.
   * The Author sets this; only an Editor moves `publishedRevisionId`.
   * It is not advanced automatically when a newer revision is created — the
   * Editor must always see exactly the revision that was submitted.
   */
  @Column({ name: 'submitted_revision_id', type: 'uuid', nullable: true })
  submittedRevisionId!: string | null;

  @ManyToOne(() => Revision, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'submitted_revision_id' })
  submittedRevision!: Revision | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt!: Date | null;

  /**
   * Future publish of an existing revision. Does not make the article public.
   * Cleared in the same UPDATE that sets `publishedRevisionId` / `publishedAt`.
   */
  @Column({ name: 'scheduled_revision_id', type: 'uuid', nullable: true })
  scheduledRevisionId!: string | null;

  @ManyToOne(() => Revision, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'scheduled_revision_id' })
  scheduledRevision!: Revision | null;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;

  @OneToMany(() => Revision, (revision) => revision.article)
  revisions!: Revision[];

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.article)
  articleTags!: ArticleTag[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments!: Comment[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
