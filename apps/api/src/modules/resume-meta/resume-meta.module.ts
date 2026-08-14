import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeMeta } from './resume-meta.entity';
import { ResumeMetaController } from './resume-meta.controller';
import { ResumeMetaService } from './resume-meta.service';

@Module({
  imports: [TypeOrmModule.forFeature([ResumeMeta])],
  controllers: [ResumeMetaController],
  providers: [ResumeMetaService],
  exports: [ResumeMetaService],
})
export class ResumeMetaModule {}
