import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../media/media.entity';
import { RevisionMedia } from '../media/revision-media.entity';
import { ArticleTag } from '../tags/article-tag.entity';
import { Tag } from '../tags/tag.entity';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';
import { ArticlesService } from './articles.service';
import { ArticleScheduleTicker } from './article-schedule-ticker';
import { Article } from './article.entity';
import { Revision } from './revision.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Revision, Tag, ArticleTag, Media, RevisionMedia]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesRepository, ArticlesService, ArticleScheduleTicker],
  exports: [ArticlesService, TypeOrmModule],
})
export class ArticlesModule {}
