import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'issue_labels' })
@Unique('uq_issue_label', ['issueId', 'labelId'])
export class IssueLabel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'label_id', type: 'uuid' }) labelId!: string;
}
