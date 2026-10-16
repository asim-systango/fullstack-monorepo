import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { UserRole } from '../../users/user.entity';
import { MemberStatus } from '../enums/member-status.enum';

export const MEMBER_LIST_ROLES = ['admin', 'user', 'staff'] as const;

export const MEMBER_LIST_SORT_FIELDS = [
  'fullName',
  '-fullName',
  'createdAt',
  '-createdAt',
] as const;

export class ListMembersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @IsOptional()
  @IsIn(MEMBER_LIST_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsIn(MEMBER_LIST_SORT_FIELDS)
  sort?: (typeof MEMBER_LIST_SORT_FIELDS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
