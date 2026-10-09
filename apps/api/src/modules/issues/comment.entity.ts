import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'author_id', type: 'uuid' }) authorId!: string;
  @Column({ type: 'text' }) body!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
