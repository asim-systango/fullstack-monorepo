import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanExerciseDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  exerciseName!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  targetSets!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  targetReps!: number;
}

export class PlanDayDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  dayLabel!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order!: number;

  @ApiProperty({ type: [PlanExerciseDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlanExerciseDto)
  exercises!: PlanExerciseDto[];
}

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [PlanDayDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PlanDayDto)
  days!: PlanDayDto[];
}
