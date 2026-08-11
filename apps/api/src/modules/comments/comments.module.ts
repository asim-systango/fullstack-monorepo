import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/article.entity';
import { Comment } from './comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Article])],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsService],
  exports: [CommentsService, TypeOrmModule],
})
export class CommentsModule {}
