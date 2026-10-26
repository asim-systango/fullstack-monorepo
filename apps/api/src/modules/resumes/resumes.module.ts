import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesModule } from '../templates';
import { AdminResumesController } from './admin-resumes.controller';
import { Resume } from './resume.entity';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { SectionItem } from './section-item.entity';
import { Section } from './section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resume, Section, SectionItem]), TemplatesModule],
  controllers: [ResumesController, AdminResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
