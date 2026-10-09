import { IsArray, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ISSUE_STATUSES } from './types';

export class CreateIssueDto {
  @IsString() @Length(1, 200) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID() assigneeId?: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) labelIds?: string[];
}

export class ChangeStatusDto {
  @IsIn(ISSUE_STATUSES) status!: (typeof ISSUE_STATUSES)[number];
}

export class CreateCommentDto {
  @IsString() @Length(1, 2000) body!: string;
}

export class IssueFilterDto {
  @IsOptional() @IsIn(ISSUE_STATUSES) status?: (typeof ISSUE_STATUSES)[number];
  @IsOptional() @IsUUID() labelId?: string;
  @IsOptional() @IsUUID() assigneeId?: string;
  @IsOptional() page?: string;
}
