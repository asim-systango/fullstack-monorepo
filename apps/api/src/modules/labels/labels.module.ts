import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects';
import { Label } from './label.entity';
import { IssueLabel } from './issue-label.entity';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Label, IssueLabel]), ProjectsModule],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService, TypeOrmModule],
})
export class LabelsModule {}
