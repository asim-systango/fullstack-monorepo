import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Lesson } from '../lessons/lesson.entity';
import { Quiz } from '../quizzes/quiz.entity';

@Entity({ name: 'courses' })
@Index('IDX_courses_slug', ['slug'], { unique: true })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId!: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons!: Lesson[];

  @OneToMany(() => Quiz, (quiz) => quiz.course)
  quizzes!: Quiz[];
}
