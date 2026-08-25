import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSetDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  reps!: number;

  @ApiPropertyOptional({
    description: 'Omit for bodyweight sets with no external weight',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;
}

export class CreateExerciseLogDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  exerciseName!: string;

  @ApiProperty({ type: [CreateSetDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSetDto)
  sets!: CreateSetDto[];
}

export class CreateWorkoutDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsDateString()
  performedAt!: string;

  @ApiProperty({ type: [CreateExerciseLogDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseLogDto)
  exercises!: CreateExerciseLogDto[];
}
