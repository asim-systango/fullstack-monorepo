import { ApiProperty } from '@nestjs/swagger';
import { SlaPriority } from '../sla-policy.entity';

export class SlaPolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SlaPriority })
  priority!: SlaPriority;

  @ApiProperty()
  firstResponseHours!: number;

  @ApiProperty()
  resolutionHours!: number;
}

export class CategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: [SlaPolicyResponseDto] })
  slaPolicies!: SlaPolicyResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
