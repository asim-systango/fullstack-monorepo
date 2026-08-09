import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';

/** Entity registration only — comment APIs come later. */
@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
