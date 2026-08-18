import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../courses/course.entity';
import { Question } from './question.entity';
import { Submission } from '../submissions/submission.entity';

@Entity({ name: 'quizzes' })
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.quizzes, { onDelete: 'CASCADE' })
  course!: Course;

  @Column({ type: 'timestamptz', nullable: true })
  dueAt?: Date | null;

  @Column()
  title!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions!: Question[];

  @OneToMany(() => Submission, (submission) => submission.quiz)
  submissions!: Submission[];
}
