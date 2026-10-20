import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, Ticket } from '../ticket.entity';
import { SlaPriority } from '../../categories/sla-priority.enum';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class TicketResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: '10024' })
  ticketNumber!: string;

  @ApiProperty({ example: 'Cannot access payment gateway dashboard' })
  subject!: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.OPEN })
  status!: TicketStatus;

  @ApiProperty({ enum: SlaPriority, example: SlaPriority.MEDIUM })
  priority!: SlaPriority;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  categoryId!: string;

  @ApiPropertyOptional({ type: () => CategoryResponseDto })
  category?: CategoryResponseDto;

  @ApiProperty({ example: 'b1f8c290-7d34-406a-8fa5-7c8591e1d099' })
  userId!: string;

  @ApiPropertyOptional({
    example: 'c2f8c290-7d34-406a-8fa5-7c8591e1d099',
    nullable: true,
  })
  assigneeId!: string | null;

  @ApiProperty({ example: 1 })
  version!: number;

  @ApiPropertyOptional({ example: '2026-08-15T12:00:00Z', nullable: true })
  firstResponseDueAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-08-14T15:00:00Z', nullable: true })
  firstResponseAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-08-17T12:00:00Z', nullable: true })
  resolutionDueAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-08-16T10:00:00Z', nullable: true })
  resolvedAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-08-16T11:00:00Z', nullable: true })
  closedAt!: Date | null;

  @ApiProperty({ example: { browser: 'Chrome 120' } })
  metadata!: Record<string, unknown>;

  @ApiProperty({ example: '2026-08-14T12:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-14T12:00:00Z' })
  updatedAt!: Date;

  public static fromEntity(entity: Ticket): TicketResponseDto {
    const dto = new TicketResponseDto();
    dto.id = entity.id;
    dto.ticketNumber = String(entity.ticketNumber);
    dto.subject = entity.subject;
    dto.status = entity.status;
    dto.priority = entity.priority;
    dto.categoryId = entity.categoryId;
    if (entity.category) {
      dto.category = {
        id: entity.category.id,
        name: entity.category.name,
        slug: entity.category.slug,
        description: entity.category.description ?? null,
        isActive: entity.category.isActive,
        slaPolicies: (entity.category.slaPolicies || []).map((p) => ({
          id: p.id,
          priority: p.priority,
          firstResponseHours: p.firstResponseHours,
          resolutionHours: p.resolutionHours,
        })),
        createdAt: entity.category.createdAt,
        updatedAt: entity.category.updatedAt,
      };
    }
    dto.userId = entity.userId;
    dto.assigneeId = entity.assigneeId ?? null;
    dto.version = entity.version;
    dto.firstResponseDueAt = entity.firstResponseDueAt ?? null;
    dto.firstResponseAt = entity.firstResponseAt ?? null;
    dto.resolutionDueAt = entity.resolutionDueAt ?? null;
    dto.resolvedAt = entity.resolvedAt ?? null;
    dto.closedAt = entity.closedAt ?? null;
    dto.metadata = entity.metadata || {};
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
