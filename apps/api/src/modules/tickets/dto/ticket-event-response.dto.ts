import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketEvent } from '../ticket-event.entity';

export class TicketEventResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  ticketId!: string;

  @ApiProperty({ example: 'b1f8c290-7d34-406a-8fa5-7c8591e1d099' })
  actorId!: string;

  @ApiProperty({ example: 'STATUS_CHANGE' })
  eventType!: string;

  @ApiPropertyOptional({ example: { status: 'open' }, nullable: true })
  oldValue!: Record<string, unknown> | null;

  @ApiPropertyOptional({ example: { status: 'pending' }, nullable: true })
  newValue!: Record<string, unknown> | null;

  @ApiPropertyOptional({
    example: 'Moved to pending while awaiting user feedback',
    nullable: true,
  })
  reason!: string | null;

  @ApiProperty({ example: '2026-08-14T12:00:00Z' })
  createdAt!: Date;

  public static fromEntity(entity: TicketEvent): TicketEventResponseDto {
    const dto = new TicketEventResponseDto();
    dto.id = entity.id;
    dto.ticketId = entity.ticketId;
    dto.actorId = entity.actorId;
    dto.eventType = entity.eventType;
    dto.oldValue = entity.oldValue ?? null;
    dto.newValue = entity.newValue ?? null;
    dto.reason = entity.reason ?? null;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
