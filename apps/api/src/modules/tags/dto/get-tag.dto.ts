import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

/** Route params for GET/PATCH/DELETE /tags/:id */
export class TagIdParam {
  @IsUUID('4')
  id!: string;
}

/** Query params for GET /tags */
export class ListTagsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

/** Tag fields returned by single-tag endpoints */
export type TagResponse = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

/** One item in GET /tags */
export type TagListItem = {
  id: string;
  name: string;
};

/** Paginated response for GET /tags */
export type TagListResponse = {
  data: TagListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
