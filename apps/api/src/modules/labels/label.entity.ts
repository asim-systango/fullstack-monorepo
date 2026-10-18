import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { IssueLabel } from './issue-label.entity';

@Entity({ name: 'labels' })
@Unique('UQ_labels_project_name', ['projectId', 'name'])
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ type: 'varchar', length: 60 })
  name!: string;

  @Column({ type: 'varchar', length: 20, default: '#64748b' })
  color!: string;

  @OneToMany(() => IssueLabel, (il) => il.label)
  issueLabels!: IssueLabel[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
