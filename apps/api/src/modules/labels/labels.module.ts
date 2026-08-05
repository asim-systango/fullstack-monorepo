import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './label.entity';
import { IssueLabel } from './issue-label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Label, IssueLabel])],
})
export class LabelsModule {}
