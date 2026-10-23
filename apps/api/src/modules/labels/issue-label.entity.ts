import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Issue } from '../issues/issue.entity';
import { Label } from './label.entity';

@Entity({ name: 'issue_labels' })
@Unique('UQ_issue_labels_issue_label', ['issueId', 'labelId'])
export class IssueLabel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'issue_id', type: 'uuid' })
  issueId!: string;

  @ManyToOne(() => Issue, (issue) => issue.issueLabels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue!: Issue;

  @Column({ name: 'label_id', type: 'uuid' })
  labelId!: string;

  @ManyToOne(() => Label, (label) => label.issueLabels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'label_id' })
  label!: Label;
}
