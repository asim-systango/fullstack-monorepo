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

  @Column({ type: 'uuid' })
  instructorId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons!: Lesson[];

  @OneToMany(() => Quiz, (quiz) => quiz.course)
  quizzes!: Quiz[];
}
