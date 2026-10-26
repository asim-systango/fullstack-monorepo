import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Template } from '../templates/template.entity';
import { Section } from './section.entity';

export type ResumeStatus = 'draft' | 'published';

@Entity({ name: 'resumes' })
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Gateway user id — no FK to users table from domain API. */
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @Column()
  title!: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string;

  @ManyToOne(() => Template, { eager: true })
  @JoinColumn({ name: 'template_id' })
  template!: Template;

  @Column({ name: 'full_name', type: 'varchar', default: '' })
  fullName!: string;

  @Column({ type: 'varchar', default: '' })
  email!: string;

  @Column({ type: 'varchar', default: '' })
  phone!: string;

  @Column({ type: 'varchar', default: '' })
  location!: string;

  @Column({ type: 'text', default: '' })
  summary!: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: ResumeStatus;

  @Column({ type: 'varchar', nullable: true, unique: true })
  slug!: string | null;

  @OneToMany(() => Section, (section) => section.resume, {
    cascade: true,
    eager: false,
  })
  sections!: Section[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
