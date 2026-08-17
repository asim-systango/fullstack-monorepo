import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateExerciseLogDto } from './create-workout.dto';

export class UpdateWorkoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  performedAt?: string;

  @ApiPropertyOptional({
    type: [CreateExerciseLogDto],
    description:
      'When provided, replaces the entire exercise/set tree and recomputes personal ' +
      'records for every exercise affected (old and new), since an edit can lower or ' +
      'remove a prior best, not just beat it.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseLogDto)
  exercises?: CreateExerciseLogDto[];
}
