import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from '../lessons/lesson.entity';

@Entity({ name: 'lesson_progress' })
@Index('IDX_lesson_progress_lesson_student', ['lessonId', 'studentId'], { unique: true })
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  lessonId!: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress, { onDelete: 'CASCADE' })
  lesson!: Lesson;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
