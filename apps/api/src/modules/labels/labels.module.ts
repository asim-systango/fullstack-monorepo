import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { Label } from './label.entity';
import { IssueLabel } from './issue-label.entity';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Label, IssueLabel]), ProjectsModule],
  controllers: [LabelsController],
  providers: [LabelsService],
})
export class LabelsModule {}
