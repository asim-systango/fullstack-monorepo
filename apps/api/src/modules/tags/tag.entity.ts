import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleTag } from './article-tag.entity';

/**
 * Tag catalog. `normalizedName` is the canonical unique key
 * (e.g. React / react / REACT → same normalizedName).
 */
@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ name: 'normalized_name', type: 'varchar', unique: true })
  normalizedName!: string;

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.tag)
  articleTags!: ArticleTag[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
