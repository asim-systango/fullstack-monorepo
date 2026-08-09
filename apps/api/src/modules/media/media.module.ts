import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './media.entity';
import { RevisionMedia } from './revision-media.entity';

/** Entity registration only — upload/ACL services come later. */
@Module({
  imports: [TypeOrmModule.forFeature([Media, RevisionMedia])],
  exports: [TypeOrmModule],
})
export class MediaModule {}
