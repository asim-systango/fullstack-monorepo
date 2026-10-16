import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Section } from './section.entity';

@Entity({ name: 'section_items' })
@Check(`"position" >= 0`)
export class SectionItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'section_id', type: 'uuid' })
  sectionId!: string;

  @ManyToOne(() => Section, (section) => section.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section!: Section;

  @Column({ type: 'varchar', default: '' })
  heading!: string;

  @Column({ type: 'varchar', default: '' })
  subheading!: string;

  @Column({ name: 'start_date', type: 'varchar', default: '' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'varchar', default: '' })
  endDate!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'int', default: 0 })
  position!: number;
}
