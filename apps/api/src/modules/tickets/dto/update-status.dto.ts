import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../ticket.entity';

export class UpdateStatusDto {
  @ApiProperty({ enum: TicketStatus, example: TicketStatus.PENDING })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status!: TicketStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Expected ticket version for optimistic locking check',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedVersion?: number;

  @ApiPropertyOptional({
    example: 'Waiting on user response regarding reproduction steps.',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
