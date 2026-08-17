import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Message, MessageType } from '../message.entity';
import { Attachment } from '../attachment.entity';

export class AttachmentResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'https://example.com/files/auth.log' })
  url!: string;

  @ApiProperty({ example: 'auth.log' })
  filename!: string;

  @ApiProperty({ example: 'text/plain' })
  mimeType!: string;

  @ApiProperty({ example: 1024 })
  sizeBytes!: number;

  public static fromEntity(entity: Attachment): AttachmentResponseDto {
    const dto = new AttachmentResponseDto();
    dto.id = entity.id;
    dto.url = entity.url;
    dto.filename = entity.filename;
    dto.mimeType = entity.mimeType;
    dto.sizeBytes = Number(entity.sizeBytes);
    return dto;
  }
}

export class MessageResponseDto {
  @ApiProperty({ example: 'm1111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  ticketId!: string;

  @ApiProperty({ example: 'b47c943e-3221-4f18-974a-4e2b02e7d701' })
  userId!: string;

  @ApiProperty({ example: 'b47c943e-3221-4f18-974a-4e2b02e7d701' })
  senderId!: string;

  @ApiProperty({ enum: MessageType, example: MessageType.PUBLIC })
  messageType!: MessageType;

  @ApiProperty({ example: false })
  isInternal!: boolean;

  @ApiProperty({ example: 'Checking auth logs for user.' })
  body!: string;

  @ApiProperty({ example: {} })
  metadata!: Record<string, unknown>;

  @ApiProperty({ example: '2026-08-12T11:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: [AttachmentResponseDto] })
  attachments!: AttachmentResponseDto[];

  @ApiPropertyOptional({
    example: { id: 'uuid', name: 'John Doe', email: 'user@example.com', role: 'user' },
  })
  sender?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  };

  public static fromEntity(entity: Message): MessageResponseDto {
    const dto = new MessageResponseDto();
    dto.id = entity.id;
    dto.ticketId = entity.ticketId;
    dto.userId = entity.userId;
    dto.senderId = entity.userId;
    dto.messageType = entity.messageType;
    dto.isInternal = entity.messageType === MessageType.INTERNAL_NOTE;
    dto.body = entity.body;
    dto.metadata = entity.metadata || {};
    dto.createdAt = entity.createdAt;
    dto.attachments = (entity.attachments || []).map((att) =>
      AttachmentResponseDto.fromEntity(att),
    );
    if (entity.user) {
      dto.sender = {
        id: entity.user.id,
        email: entity.user.email,
        name: entity.user.name,
        role: entity.user.role,
      };
    }
    return dto;
  }
}
