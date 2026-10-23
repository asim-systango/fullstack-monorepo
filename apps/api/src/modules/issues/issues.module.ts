import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects';
import { Label } from '../labels/label.entity';
import { IssueLabel } from '../labels/issue-label.entity';
import { Issue } from './issue.entity';
import { Comment } from './comment.entity';
import { ActivityLog } from './activity-log.entity';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, Comment, ActivityLog, Label, IssueLabel]),
    ProjectsModule,
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService, TypeOrmModule],
})
export class IssuesModule {}
