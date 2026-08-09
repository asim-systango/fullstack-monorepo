import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Tag } from './tag.entity';

/**
 * Explicit Article ↔ Tag join. Composite PK enforces uniqueness
 * of (articleId, tagId) without a surrogate id.
 */
@Entity({ name: 'article_tags' })
@Index('IDX_article_tags_tag_id', ['tagId'])
export class ArticleTag {
  @PrimaryColumn({ name: 'article_id', type: 'uuid' })
  articleId!: string;

  @PrimaryColumn({ name: 'tag_id', type: 'uuid' })
  tagId!: string;

  @ManyToOne(() => Article, (article) => article.articleTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article!: Article;

  @ManyToOne(() => Tag, (tag) => tag.articleTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tag_id' })
  tag!: Tag;
}
