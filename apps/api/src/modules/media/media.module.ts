import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage';
import { Media } from './media.entity';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';
import { RevisionMedia } from './revision-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media, RevisionMedia]), StorageModule],
  controllers: [MediaController],
  providers: [MediaRepository, MediaService],
  exports: [MediaService, TypeOrmModule],
})
export class MediaModule {}
