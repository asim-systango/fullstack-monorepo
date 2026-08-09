import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
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
 * (not a boolean flag). Soft-delete via `deletedAt`.
 *
 * `authorId` is an opaque gateway user UUID — no local User FK.
 */
@Entity({ name: 'articles' })
@Check(
  'CHK_articles_published_pair',
  `(("published_revision_id" IS NULL AND "published_at" IS NULL) OR ("published_revision_id" IS NOT NULL AND "published_at" IS NOT NULL))`,
)
@Index('IDX_articles_author_id', ['authorId'])
@Index('IDX_articles_published_revision_id', ['publishedRevisionId'])
@Index('IDX_articles_deleted_at', ['deletedAt'])
@Index('IDX_articles_public', ['publishedAt'], {
  where: '"published_revision_id" IS NOT NULL AND "deleted_at" IS NULL',
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
