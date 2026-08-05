import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { Issue } from './issue.entity';
import { Comment } from './comment.entity';
import { ActivityLog } from './activity-log.entity';
import { IssueLabel } from '../labels/issue-label.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, Comment, ActivityLog, IssueLabel]),
    ProjectsModule,
  ],
})
export class IssuesModule {}
