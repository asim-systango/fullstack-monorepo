import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';

export type QuestionType = 'mcq' | 'short_answer';

@Entity({ name: 'questions' })
@Index('IDX_questions_quiz_position', ['quizId', 'position'], { unique: true })
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  quizId!: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  quiz!: Quiz;

  @Column({ type: 'varchar', length: 20 })
  type!: QuestionType;

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'text', nullable: true })
  correctAnswer?: string;

  @Column({ type: 'jsonb', nullable: true })
  choices?: string[];

  @Column({ type: 'integer' })
  position!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
