import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from './group.entity';

export type GroupInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

@Entity({ name: 'group_invitations' })
export class GroupInvitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @Column({ name: 'invited_by_user_id', type: 'uuid' })
  invitedByUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invited_by_user_id' })
  invitedBy!: User;

  @Column({ name: 'invitee_email' })
  inviteeEmail!: string;

  @Column({ name: 'invitee_user_id', type: 'uuid', nullable: true })
  inviteeUserId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invitee_user_id' })
  inviteeUser!: User | null;

  @Column({ name: 'invite_token_hash' })
  inviteTokenHash!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: GroupInvitationStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
