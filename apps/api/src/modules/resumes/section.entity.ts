import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Resume } from './resume.entity';
import { SectionItem } from './section-item.entity';

export type SectionType = 'experience' | 'education' | 'skills' | 'projects' | 'custom';

@Entity({ name: 'sections' })
@Check(`"position" >= 0`)
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId!: string;

  @ManyToOne(() => Resume, (resume) => resume.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Column({ type: 'varchar', length: 32 })
  type!: SectionType;

  @Column()
  title!: string;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @OneToMany(() => SectionItem, (item) => item.section, {
    cascade: true,
    eager: false,
  })
  items!: SectionItem[];
}
