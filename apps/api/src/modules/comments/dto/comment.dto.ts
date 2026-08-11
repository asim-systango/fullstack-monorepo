import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** Request body for POST /articles/:articleId/comments */
export class CreateCommentDto {
  @ApiProperty({
    example: 'Great article!',
    description: 'Trimmed; empty/whitespace rejected',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  body!: string;
}

/** Request body for PATCH /comments/:id — body only; ownership/articleId immutable. */
export class UpdateCommentDto {
  @ApiProperty({
    example: 'Updated comment',
    description: 'Trimmed; empty/whitespace rejected',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  body!: string;
}
