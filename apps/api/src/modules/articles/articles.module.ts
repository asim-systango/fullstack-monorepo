import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Revision } from './revision.entity';

/** Entity registration only — CRUD/publish services come later. */
@Module({
  imports: [TypeOrmModule.forFeature([Article, Revision])],
  exports: [TypeOrmModule],
})
export class ArticlesModule {}
