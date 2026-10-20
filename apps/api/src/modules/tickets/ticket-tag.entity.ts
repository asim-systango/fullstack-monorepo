import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './ticket.entity';
import { Tag } from './tag.entity';

@Entity('ticket_tags')
export class TicketTag {
  @PrimaryColumn({ type: 'uuid', name: 'ticket_id' })
  ticketId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'tag_id' })
  tagId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.ticketTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket;

  @ManyToOne(() => Tag, (tag) => tag.ticketTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tag_id' })
  tag!: Tag;
}
