import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleTag } from './article-tag.entity';
import { Tag } from './tag.entity';

/** Entity registration only — tag CRUD comes later. */
@Module({
  imports: [TypeOrmModule.forFeature([Tag, ArticleTag])],
  exports: [TypeOrmModule],
})
export class TagsModule {}
