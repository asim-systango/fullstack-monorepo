import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleTag } from './article-tag.entity';
import { Tag } from './tag.entity';
import { TagsController } from './tags.controller';
import { TagsRepository } from './tags.repository';
import { TagsService } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, ArticleTag])],
  controllers: [TagsController],
  providers: [TagsRepository, TagsService],
  exports: [TagsService, TypeOrmModule],
})
export class TagsModule {}
