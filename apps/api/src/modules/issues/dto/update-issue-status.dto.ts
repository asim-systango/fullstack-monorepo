import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { IssueStatus } from '../issue.entity';

export class UpdateIssueStatusDto {
  @ApiProperty({ enum: ['todo', 'in_progress', 'done'] })
  @IsIn(['todo', 'in_progress', 'done'])
  status!: IssueStatus;
}
