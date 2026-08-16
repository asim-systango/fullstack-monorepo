import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateProjectDto {
  @IsString() @Length(1, 100) name!: string;
  @IsString() @Length(1, 10) key!: string;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() @Length(1, 100) name?: string;
}

export class AddMemberDto {
  @IsUUID() userId!: string;
  @IsIn(['project_lead', 'member']) projectRole!: 'project_lead' | 'member';
}
