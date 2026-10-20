import { IsUUID, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTicketDto {
  @ApiProperty({
    example: 'b1f8c290-7d34-406a-8fa5-7c8591e1d099',
    nullable: true,
    description: 'User ID of the assigned staff member or null to unassign',
  })
  @IsOptional()
  @IsUUID()
  assigneeId!: string | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'Expected ticket version for optimistic locking check',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedVersion?: number;

  @ApiPropertyOptional({
    example: 'Reassigned due to expertise in payment integrations',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
