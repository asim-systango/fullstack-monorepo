import { IsOptional, IsDateString, IsString, IsUUID, Length } from 'class-validator';

export class CreateSprintDto {
  @IsString() @Length(1, 80) name!: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
}

export class AssignSprintDto {
  @IsOptional() @IsUUID() sprintId?: string;
}
