import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from '../quizzes/quiz.entity';
import { Grade } from '../grades/grade.entity';

@Entity({ name: 'submissions' })
@Index('IDX_submissions_quiz_student', ['quizId', 'studentId'], { unique: true })
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  quizId!: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.submissions, { onDelete: 'CASCADE' })
  quiz!: Quiz;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'jsonb' })
  answers!: Array<{ questionId: string; answer: string }>;

  @CreateDateColumn({ type: 'timestamptz' })
  submittedAt!: Date;

  @OneToOne(() => Grade, (grade) => grade.submission)
  grade!: Grade;
}
