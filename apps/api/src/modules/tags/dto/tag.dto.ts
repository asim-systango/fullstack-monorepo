import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** Request body for POST /tags */
export class CreateTagDto {
  @ApiProperty({ example: 'TypeScript', description: 'Stored trimmed and lowercased' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;
}

/** Request body for PATCH /tags/:id — same shape as create (rename). */
export class UpdateTagDto extends CreateTagDto {}
